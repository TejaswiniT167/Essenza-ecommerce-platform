import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req,res,next)=>{
    try{
        const accessToken = req.cookies.accessToken;
        //without importing jwt we can't get the above accessToken idiot!

        if(!accessToken){
            return res.status(401).json({message: "Unauthorized - No access token provided"});
        }
        
        try{
            const decoded = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded.userId).select("-password"); //i.e wont select the password property of the user :)

            if(!user){
                return res.status(401).json({message: "User not found"});
            }

            req.user=user; //if user found with the valid user_id we have in the accessToken.
            next(); //to continue to next callback func after this, from where it is called.
        }
        catch(error){
            if(error.name==="TokenExpiredError"){
                return res.status(401).json({message: "Unauthorized - Access token expried"});
            }
            throw error;
        }
    }
    catch(error){
        console.log("Error in productRoute middleware",error.message);
        return res.status(401).json({message: "Unauthorized - Invalid access token"});
    }
 }


 export const adminRoute = async (req,res,next)=>{
    if(req.user && req.user.role==='admin'){
        next();//to continue to next callback func after this, from where it is called.
    }
    else{
        return res.status(403).json({message: "Access Denied - Admin Only"});
    }
 }