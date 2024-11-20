import express from 'express';
import {getCartProducts, addToCart, removeAllFromCart, updateQuantity} from '../controllers/cart.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router= express.Router();

router.get("/",protectRoute, getCartProducts);
//get all the loggedin user cart products.

router.post('/',protectRoute, addToCart);
//so only logged in users/customers can add to cart

router.delete('/',protectRoute, removeAllFromCart);
//deleting the item as a whole from the cart.

router.put('/:id',protectRoute, updateQuantity);
//updating the quantity of the item in the cart.

export default router;