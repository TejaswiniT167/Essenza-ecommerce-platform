//axios faster and more diverse than fetch

import axios from "axios";

const axiosIntance = axios.create({
    baseURL: import.meta.mode === "development" ? "http://localhost:5000/api": "/api",
    //in development it's above url.
    //i.e in production/deployment it will be "whatever endpoint we assign like https://e-commerce-xyz-platform/api" :)

    withCredentials: true, //allows us to send the cookies with the req by default, 
    // this will be cheked in auth.middeleware in backend :)
});
//this instance we will using in different pages.

export default  axiosIntance;