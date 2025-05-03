import { populate } from "dotenv";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import mongoose from "mongoose";

const addToCart = AsyncHandler(async (req, res, next) => {

    let { productId, quantity, userId } = req.body
    console.log(productId,userId,quantity)

    if (!quantity){
        quantity = 1; 
    }  // Default to 1 if missing
    if (isNaN(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity! Must be a positive number.",
      });
    }
    
    quantity = Number(quantity); // Convert to number explicitly

    if (!productId || !userId  || quantity<=0) {
        throw new ApiError(400, "Invalid Data")
    }

    const product = await Product.findById(productId)
    if (!product) {
        throw new ApiError(400, "Product not found")
    }

    //stock cheking - for requst ki quantity 
    if(quantity > product.stock){
        throw new ApiError(400,"Out of Stock pls enter low Quantity.")
    }

    console.log("stock",product.stock)
    console.log(quantity)
    // kaya userId no cart che te 
    let cart = await Cart.findOne({ userId })

    //cart na hoi to cart no instance kro create
    if (!cart) {
        cart = new Cart({ userId, items: [] })
    }

    // product hoi to only quantity j add karo na hoi to items add karo
    //cart na items ni andder products adding
    //items array che FInding that
    //item made single chking it id is our req.body.prductid

    const cartMeProductAlreadyHaiChk = cart.items.findIndex((item) => item.productId.toString() === productId)

    //That means k product nathi cart ma cart is empty so We are creating the cart and push it that product with quantity.
    if (cartMeProductAlreadyHaiChk === -1) {
        cart.items.push({ productId, quantity })

    }
    //quantity +1 kr rahe hai.
    else {
        // console.log("Quantiy hai and than stock")
        // console.log(cart.items[cartMeProductAlreadyHaiChk].quantity)
        // console.log(product.stock)
        if(cart.items[cartMeProductAlreadyHaiChk].quantity>=product.stock){
            throw new ApiError(400,"Out of Stock.")
        }
        cart.items[cartMeProductAlreadyHaiChk].quantity += quantity
    }

    await cart.save()

    const mycart=await Cart.findOne({userId})
    .populate({
        path:"items.productId",
        select:"productName price description stock mainProductImg"
    })


    res.status(201).json(new ApiResponse(200, mycart, "Added To Cart"))

})

const updateCartQuantity = AsyncHandler(async (req, res, next) => {

    const { userId, productId, quantity } = req.body
    
    console.log("User id ",userId)
    console.log("product id ",productId)
    console.log("quantity ",quantity)

    if (!userId || !productId || quantity <= 0) {
        throw new ApiError(400, "Invalid Data...")
    }

    const product = await Product.findById(productId)
    if (!product) {
        throw new ApiError(400, "Product not found")
    }

    if(quantity> product.stock){
        throw new ApiError(400, "Out of stock.")
    }

    let cart = await Cart.findOne({ userId })

    if (!cart) {
        throw new ApiError(400, "Cart not found")
    }


    const cartMeProductAlreadyHaiChk = cart.items.findIndex((item) => item.productId.toString() === productId)
    //return true it give index if that else give-1
    //    console.log(cartMeProductAlreadyHaiChk)

    //alredy in cart so update it
    if (cartMeProductAlreadyHaiChk !== -1) {
        cart.items[cartMeProductAlreadyHaiChk].quantity = quantity
    }
    else {
        throw new ApiError(400, "Not found any product in cart")
    }

    await cart.save()

    res.status(200).json(new ApiResponse(200, cart, "UpdatedCart"))

})

const deleteCartItem = AsyncHandler(async (req, res, next) => {

    const { userId, productId } = req.params

    if (!userId || !productId ) {
        throw new ApiError(400, "provide the userid ")
    }

    let cart = await Cart.findOne({ userId }).populate("items.productId")


    if (!cart) {
        throw new ApiError(400, "Cart not found")
    }

    const product = await Product.findById(productId)
    if(!product){
        throw new ApiError(400, "Product not found.")
    }

    const productExists = cart.items.some((item) => item.productId._id.toString() === productId);

    if (!productExists) {
        throw new ApiError(400, "Product is already deleted or does not exist in the cart.");
    }
    
    cart.items = cart.items.filter((item) => item.productId._id.toString() !== productId)
    
    await cart.save()

    res.status(200).json(new ApiResponse(200, {}, "Deleted Successfully cart item"))


})

const getCartItems = AsyncHandler(async (req, res, next) => {

    const { userId } = req.params
    console.log(userId)

    if (!userId) {
        throw new ApiError(400, "Userid required")
    }

    const cart = await Cart.findOne({ userId })
    .populate({
        path:"items.productId",
        select:"productName price description mainProductImg stock"
    })
    
    
    // console.log(cart.items)
    if (!cart) {
        throw new ApiError(400, "Cart not found")
    }

    cart.items= cart.items.filter((item)=>item.productId!==null)

    await cart.save()

    res.status(200).json(new ApiResponse(200, {
        cartItem: cart
    }, "Getting Cart Items"))

})

const clearCart = AsyncHandler(async (req,res,next)=>{
    const {userId}= req.params;
    console.log(userId)
    if(!userId){
        throw new ApiError(400,"User id required.")
    }

    await Cart.deleteMany({userId})

    res.status(200).json(new ApiResponse(200,{}, "Cart Cleared Successfully"))
})

export {
    addToCart,
    updateCartQuantity,
    deleteCartItem,
    getCartItems,
    clearCart
}
