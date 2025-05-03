import mongoose from "mongoose"

const paymentSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String, 
        
    },
    razorpaySignature: {
        type: String
    },
    paymentMethod: {
        type: String, enum: ["Credit Card", "PayPal", "UPI", "Debit Card", "Bank Transfer", "Google Pay", "Apple Pay", "Cash on Delivery"]
    },
    amount: {
        type: Number, required: true
    },
    status: { type: String, enum: ["Pending" ,"Completed", "Canceled"], required: true },

},{timestamps:true})

const Payment = mongoose.model("Payment", paymentSchema)

export default Payment