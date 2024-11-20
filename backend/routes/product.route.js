import express from "express"; 
import {getAllProucts, getFeaturedProducts, createProduct, deleteProduct, getRecommendedProducts, getProductsByCategory, toggleFeaturedProduct} from '../controllers/product.controller.js'
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProucts);
// only admin should be able to get this! not customers, they should have one or categorized products!
//so we make this protected and admin limited.

router.get("/featured", getFeaturedProducts);
//everyone should be able to call this, even unauthenticated users, so we simply don't add any extra callbacks  like above.

router.get("/recommendations", getRecommendedProducts);
//so all can see recommended products

router.get("/category/:category",getProductsByCategory);
//to get products by selected category sent as param.

router.post("/", protectRoute, adminRoute, createProduct);
//only admin should be able to add products thus as above :)

router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
//patch for updating only certian parts
//put for updating the entire document.

router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;