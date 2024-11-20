import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getAnalyticsData, getDailySalesData } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, async (req, res) => {
	try {
		const analyticsData = await getAnalyticsData();
        //gets the entire totalUsers, totalProducts, totalSales, totalRevenue

		const endDate = new Date();
		const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        //a week before from current date.

		const dailySalesData = await getDailySalesData(startDate, endDate);
        //gives _id:date, sales, revenue for each of the last 7 days
        //in the date order with help of datemapping array we did in above function. :)

		res.json({
			analyticsData, //overall data
			dailySalesData, //week data for the analytics graph
		});
	} catch (error) {
		console.log("Error in analytics route", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

export default router;