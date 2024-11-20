import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createCheckoutSession, checkoutSuccess } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
//ofc only authenticated user/customers can do this :)

router.post("/checkout-success", protectRoute, checkoutSuccess);
//idiot checkout-success not checkout-session! :/

export default router;