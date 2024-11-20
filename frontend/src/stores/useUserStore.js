//global state for the user related data.
//like for signing up, login, logout, etc.

import {create} from "zustand";
import axios from "../lib/axios.js";
import {toast} from "react-hot-toast"; 
//used for displaying notifications/toast messages for users.

export const useUserStore = create((set,get)=>({
    user:null,
    loading: false,
    checkingAuth: true,

    signup: async({name,email,password,confirmPassword}) => {
        {/*the effing {} are very very very important cz we are sending it as an object :D */}
        set({loading: true});
        if(password!==confirmPassword){ 
            set({loading: false});
            return toast.error("Passwords don't match"); //if passwords don't match
        }
        try{
            const res= await axios.post("/auth/signup",{name,email,password});
            set({user: res.data, loading: false});
        }
        catch(error){
            set({loading: false});
            toast.error(error.response.data.message || "An error occured.");
        }
    },

    login: async(email,password) => {
        {/*here we are not sending as an object, so as simple params :D */}
        set({loading: true});
        
        try{
            const res= await axios.post("/auth/login",{email,password});
            //console.log(res)
            set({user: res.data, loading: false});
            //since res.data.user will be undefined! as we are directly sending as at bottom :D
        }
        catch(error){
            set({loading: false});
            toast.error(error.response.data.message || "An error occured.");
        }
    },

    logout: async() => {
        try{
            await axios.post("/auth/logout");
            set({user: null});
        }
        catch(error){
            toast.error(error.response.data.message || "An error occured.");
        }
    },

    checkAuth: async() =>{
        set({checkingAuth: true});
        try{
            const response = await axios.get("/auth/profile") // user logged in sent from backend.
            set({user: response.data, checkingAuth: false});
        }
        catch(error){
            console.log(error.message);
            set({user: null, checkingAuth: false});
        }
    },

    refreshToken: async() =>{
        if(get().checkingAuth) return; //if checking auth, don't refresh token. i.e avoiding multiple unncesassary attempts.

        set({ checkingAuth: true });
        try{
            const response = await axios.post("/auth/refresh-token"); 
            //getting the new access token and assigend to the cookie with the backend logic using the current refresh token as proof.
            set({checkingAuth: false});
            return response.data; //returning success message :)
        }
        catch(error){
            set({user: null, checkingAuth: false}); //if wasn't able to, may be due to some tampered refreshToken or server side/ redis side problem...throw error.
            throw error; //this is caught in below interceptor.
        }
    }
}))

//TODO Implement axios interceptor for when access token expires, to request for a new one with the refresh token.
//because the access token expires every 15 min.
//This whole accessToken-refreshToken thing is like a security check in the background without the logged in user even knowing it.
//DONEEE ! :D

let refreshPromise = null;

axios.interceptors.response.use( //i.e do/return what on fullfilled and on rejected.
    (response) => response, //i.e without 401 unauthorized error, since the accessToken is still valid in it's 15 min window.
    //if so continue as usual.
    async(error) => {
        const originalRequest = error.config; 
        if (error.response?.status === 401 && !originalRequest._retry){
            //when error, check if it's 401 and if not already retried, then retry it!
            originalRequest._retry = true;

            try{
                //if a refresh is already in progress, wait for it to finish
                if(refreshPromise){
                    await refreshPromise; 
                    return axios(originalRequest); //returning the original request, after it's promise is resolved.
                }

                //if not, starting a new refresh token as below...
                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise; //waiting for it to complete, setting the valid accessToken in the cookies.
                refreshPromise = null; //nulling it after completion as above

                return axios(originalRequest); //i.e the originalRequest like whatever the user doing say
                // admin creating product 
                // user adding to cart
                // user checking out....etc.,
                // which failed due to expired accessToken, which is now renewed thus validated now to continue. :)
            }
            catch(refreshError){
                //if refresh token failed, then logout the user.
                //as logout will remove the user from the state, and the user will be able to login again.
                useUserStore.getState().logout();
                return Promise.reject(refreshError);

            }
        } //if not even 401 error or if already retried, then return the error as rejected promise below.
        return Promise.reject(error);
    }
);



//above is used in several pages to retrieve the user state.
//any of the variables defined in the above function can be accessed as required.

/*
res object is as below:

{data: {…}, status: 200, statusText: 'OK', headers: AxiosHeaders, config: {…}, …}
config:{transitional: {…}, adapter: Array(3), transformRequest: Array(1), transformResponse: Array(1), timeout: 0, …}
data:email: "johnreact@gmail.com"
name: "johnreact"
role:"customer"_id:"6738b68e3f5a9862f31d9c38"
[[Prototype]]:Object
headers:AxiosHeaders {access-control-allow-origin: '*', connection: 'close', content-length: '101', content-type: 'application/json; charset=utf-8', date: 'Sat, 16 Nov 2024 15:52:39 GMT', …}
request:XMLHttpRequest {onreadystatechange: null, readyState: 4, timeout: 0, withCredentials: true, upload: XMLHttpRequestUpload, …}
status:200
statusText:"OK"
*/