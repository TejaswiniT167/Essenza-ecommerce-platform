import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req,res)=>{
    try{
        const coupon = await Coupon.findOne({userId:req.user._id,isActive:true});
        res.json(coupon || null);
    }
    catch(error){
        console.log("Error in getCoupon controller",error.message);
        res.status(500).json({message: "Server Error", error: error.message});
    }
}


export const validateCoupon = async (req,res)=>{
    try{
        const {code} = req.body;
        //console.log(req.user._id);
        //console.log(Coupon);
        const coupon = await Coupon.findOne({code:code,userId:req.user._id,isActive:true});

        if(!coupon){
            return res.status(404).json({message: "Coupon not found"});
        }

        if(coupon.expirationDate<new Date()){//if coupon past expiration date, have to make it inactive.
            coupon.isActive = false;
            await coupon.save();
            return res.status(400).json({message: "Coupon expired"});
        }

        //if above checks are passed, then coupon is valid and can be used.
        res.json({
            message: "Coupon is valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage
        })
    }
    catch(error){ 
        console.log("Error in validateCoupon controller",error.message);
        res.status(500).json({message: "Server Error", error: error.message});
    }
}