import express from "express";
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js'; //.js must, as we are using type 'module', extension is must when importing a local file.
import productRoutes from './routes/product.route.js';
import cartRoutes from './routes/cart.route.js'
import couponRoutes from './routes/coupon.route.js';
import paymentRoutes from './routes/payment.route.js';
import analyticsRoutes from './routes/analytics.route.js';
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser"; //for 
import path from "path";

dotenv.config();

const app =express();
const PORT= process.env.PORT||5000;

const __dirname = path.resolve();
//this dirname would be the root directory of the project application.

app.use(express.json({limit:"10mb"})); //allows u to parse the body of the request
//allows 10mb images/ Payload as whole size :)
app.use(cookieParser()); //middleware for server to be able to access the refreshToken from 
//the client request's cookies.

app.use("/api/auth",authRoutes);
app.use("/api/products",productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"/frontend/dist")));
    //setting the frontend/dist as our static directory, where the optimzied built react-app, which is served :)

    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"));
    });
    //redirecting to index.html(static asset i.e optimized version of our built react-app) i.e the entrypoint/homepage of application for invalid urls from clients.
}

app.listen(PORT,()=>{
    console.log("Server is running on http://localhost:"+PORT);
    connectDB();
})