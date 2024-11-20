import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {redis} from "../lib/redis.js";

const generateTokens = (userId)=>{
    const accessToken = jwt.sign({userId},process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
    // The payload here i.e userId is encoded and signed with a secret key i.e here the env.tokento create the JWT.
    const refreshToken = jwt.sign({userId},process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"});
    return {accessToken,refreshToken};
}

const storeRefreshToken = async (userId,refreshToken)=>{
    await redis.set(`refresh_token:${userId}`,refreshToken,"EX",7*24*60*60); //i.e expiration in 7 days i.e here in seconds.
}

const setCookies = (res,accessToken,refreshToken)=>{
    res.cookie("accessToken",accessToken,{
        httpOnly: true,
        secure: process.env.NODE_ENV==="production",
        /*What secure: true Does:
        /The secure flag ensures that cookies are only sent over HTTPS connections.
        This prevents cookies from being exposed if the connection is not encrypted (as in plain HTTP).
        */
        sameSite:"strict",
        maxAge: 15*60*1000, //15 miniutes in milli seconds.
    })
    
    res.cookie("refreshToken",refreshToken,{
        httpOnly: true,
        secure: process.env.NODE_ENV==="production",
        sameSite:"strict",
        maxAge: 7*24*60*60*1000, //7 days in milli seconds.
    })
}

export const signup= async (req,res)=>{
    const {email,password,name}=req.body;
    try
    {
    const userExists = await User.findOne({email});
    //await is very effing important here brooo as without it it's taknig true by default!

    if(userExists){
        return res.status(400).send("User already exists");
    }
    const user = await User.create({name,email,password});
    //this password will be hashed before saving it in the database thanks to the pre hook in the user model which uses bcryptjs.

    //authenticate the user
    const {accessToken,refreshToken} = generateTokens(user._id);
    await storeRefreshToken(user._id,refreshToken);

    setCookies(res,accessToken,refreshToken);

    res.status(201).json({ //since otherwise sending the whole user obj here can reveal password even though hashed on client side!
        user_id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    });
    //status code something is created successfully.
    }
    catch(error){
        console.log("Error in signup controller",error.message);
        res.status(500).json({message: error.message});
    }
}

export const login= async(req,res)=>{
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email});
        if(user && (await user.comparePassword(password))){
            const {accessToken,refreshToken} = generateTokens(user._id);
            await storeRefreshToken(user._id,refreshToken);
            setCookies(res,accessToken,refreshToken);

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            })
        }
        else{
            res.status(400).json({message: "Invalid email or password"});
            //made this 400 so this kind of error won't be considered for the refresh access token functionality we have in the frontend homepage.
        }
    }
    catch(error){
        console.log("Error in login controller ",error.message);
        res.status(500).json({message: error.message});
    }
}

export const logout= async (req,res)=>{
    try{
        const refreshToken = req.cookies.refreshToken; //this is automatically sent along with the user request body!
        if(refreshToken){ //decoding the token to get the data in it like userid
            const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decoded.userId}`);
        }

        res.clearCookie("acccesToken");
        res.clearCookie("refreshToken");
        res.json({message: "User logged out successfully"});
    }
    catch(error){
        console.log("Error in logout controller",error.message);
        res.status(500).json({message: "Server Error", error: error.message});
    }
}

//this will refresh/re-create the access token
export const refreshToken = async(req,res)=>{
    try{
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(401).json({message: "No Refresh Token provided"});
        }
        const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
        const storedRefreshToken = await redis.get(`refresh_token:${decoded.userId}`);
        //don't forget await for redis operations!!!

        if(storedRefreshToken!==refreshToken){
            return res.status(401).json({message: "Invalid Refresh Token"});
        }
        //if refresh token by user is verified as valid, we provide them with new access token :)
        const accessToken = jwt.sign({userId: decoded.userId},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"15m"});

        res.cookie("accessToken",accessToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "prodution",
            sameSite: "strict",
            maxAge: 15*60*1000,
        })

        res.json({message: "Token refreshed successfully"})
    }
    catch(error){
        console.log("Error in refreshToken controller", error.message);
        return res.status(500).json({message: "Server error", error: error.message});
    }
};

export const getProfile = async (req,res)=>{
    try{
        res.json(req.user); //as this is given by the protectRoute :)
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
}