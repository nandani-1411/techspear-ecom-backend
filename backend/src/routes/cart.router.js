import express from "express"
import { addToCart, clearCart, deleteCartItem, getCartItems, updateCartQuantity } from "../controllers/cart.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"
const router= express.Router()

router.route("/addToCart").post(verifyJwt, addToCart)
router.route("/getCartItems/:userId").get(getCartItems)
router.route("/updateQuntity").patch(updateCartQuantity)
router.route("/deleteCartItem/:userId/:productId").delete(deleteCartItem)
router.route("/clearCart/:userId").patch(verifyJwt,clearCart)

export default router