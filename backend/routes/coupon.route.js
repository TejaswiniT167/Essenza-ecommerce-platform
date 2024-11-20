import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {getCoupon, validateCoupon} from "../controllers/coupon.controller.js";

const router = express.Router();

router.get("/",protectRoute, getCoupon);
router.post("/validate",protectRoute, validateCoupon);
//it's post not get idiot...you're sending the coupon code in req body!

export default router;