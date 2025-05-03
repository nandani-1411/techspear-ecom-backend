import {AsyncHandler} from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
//For payment Creation
import { createRazorpayInstance } from "../utils/RazorpayInstance.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import Payment from "../models/payment.model.js"
import { Order } from "../models/order.model.js"
import crypto from "crypto"
import path from "path"
const createPayment = AsyncHandler(async (req, res, next) => {
  try {
    console.log("entering payment")

    const { userId, orderId, amount } = req.body
    console.log(req.body)
    // console.log(courseId)
    // console.log(amount)
    if (!userId || !orderId || !amount) {
      throw new ApiError(400, "All feild userid,orderid,and amount required")
    }

    //calling razorpy instance.
    const razorpay = createRazorpayInstance();

    const options = {
      amount: amount * 100, //need that bcz ex. 100 hai to rzorpay rs1 count so 1*100=100
      currency: "INR",
      receipt: `receipt1+${Date.now()}`,
      notes: {
        purpose: "Sample notes making payments."
      }
    }

    console.log(razorpay)

    //Razorpay order is created with above option.
    const order = await razorpay.orders.create(options);

    console.log("Order created:", order);
    // return res.status(200).json(order);
    const payment = await Payment.create({
      userId,
      orderId,
      razorpayOrderId: order.id,
      razorpayPaymentId: null, // Payment not done yet
      razorpaySignature: null,
      paymentMethod: null,
      amount,
      status: "Pending" // Payment is still pending
    });

     res.status(200).json(new ApiResponse(200, { order, payment }, "Payment Created."));

  }
  catch (er) {
    console.log(er)
    throw new ApiError(400, "error", er)
  }

})


//For Verify Payment

const verifyPayment = AsyncHandler(async (req, res, next) => {

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

  console.log(req.body)
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, "Required fild for verification of the Payment.")
  }

  const secret = process.env.RAZORPAY_SECRET_KEY;

  const hmac = crypto.createHmac("sha256", secret)

  hmac.update(razorpayOrderId + "|" + razorpayPaymentId)

  const generatedSignature = hmac.digest("hex")
  console.log(generatedSignature)
  console.log(razorpaySignature)

  if (generatedSignature !== razorpaySignature) {
    throw new ApiError(400, "Error While VerifyingPayment. Not Verified Payment.")
  }

  const razorpay = createRazorpayInstance();
  const razorpayResponse = await razorpay.payments.fetch(razorpayPaymentId);

  if (!razorpayResponse) {
    throw new ApiError(500, "Failed to fetch payment details from Razorpay.");
  }

  const paymentMethod = razorpayResponse.method;

  //update 
  const updatedPayment = await Payment.findOneAndUpdate(
    { razorpayOrderId },
    {
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod,
      status: "Completed"
    },
    { new: true } // Return updated document
  );
   res.status(200).json(new ApiResponse(200,updatedPayment,"Payment Successfully Verified & Updated In Db."))
})

//admin can see all payment...
const getAllPayment = AsyncHandler(async (req,res,next)=>{
    const allPayment = await Payment.find({}).populate("userId","name email");
    if(!allPayment || allPayment.length===0){
      throw new ApiError(400,"No found any Payments")
    }
    res.status(200).json(new ApiResponse(200,allPayment,"Getting alll Payments"))
})

const getUserPayment= AsyncHandler(async (req,res,next)=>{
  const {userId}= req.params;
  if(!userId){
    throw new ApiError(400,"Required UserId.")
  }
  const userPayment = await Payment.find({ userId })
  .populate({
    path: "orderId",
    populate: [
        { path: "userId", select: "name email" },
        {
            path: "orderItems.product", //corrected path.
            select: "productName price mainProductImg description",
        },
        { path: "addressInfo", select: "city pinCode country" },
    ],
});


  if(!userPayment || userPayment.length===0){
    throw new ApiError(400,"Not found User Payment History");
  }

  res.status(200).json(new ApiResponse(200,userPayment,"Getting User Payment History."))

})

const createCODPayment = AsyncHandler(async (req, res, next) => {

    const { userId, orderId, amount } = req.body;

    if (!userId || !orderId || !amount) {
      throw new ApiError(400, "userId, orderId, and amount are required.");
    }

    // Check if the order exists
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(400, "Order not found.");
    }

    // Create the COD payment entry (this won't involve Razorpay)
    const payment = await Payment.create({
      userId,
      orderId,
      razorpayOrderId: null, // No Razorpay order ID for COD
      razorpayPaymentId: null, // No Razorpay Payment ID for COD
      razorpaySignature: null, // No Razorpay Signature for COD
      paymentMethod: "Cash on Delivery",
      amount,
      status: "Pending", // Status is pending until delivery
    });

    res.status(200).json(new ApiResponse(200, payment, "COD payment created successfully."));
});

// Admin can view all COD payments
const getAllCODPayments = AsyncHandler(async (req, res, next) => {

    const allPayments = await Payment.find({ paymentMethod: "Cash on Delivery" }).populate("userId", "name email");

    if (!allPayments || allPayments.length === 0) {
      throw new ApiError(400, "No COD payments found.");
    }

    res.status(200).json(new ApiResponse(200, allPayments, "Getting all COD payments."));
});

const getUserCODPayments = AsyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "UserId is required.");
  }

  const userPayments = await Payment.find({ userId, paymentMethod: "Cash on Delivery" })
    .populate("orderId", "orderItems totalAmount status")
    .populate("userId", "name email");

  if (!userPayments || userPayments.length === 0) {
    throw new ApiError(400, "No COD payment history found for this user.");
  }

  res.status(200).json(new ApiResponse(200, userPayments, "Getting User's COD Payment History."));
});


export {
  createPayment,
  verifyPayment,
  getAllPayment,
  getUserPayment,
  createCODPayment,
  getAllCODPayments,
  getUserCODPayments

}