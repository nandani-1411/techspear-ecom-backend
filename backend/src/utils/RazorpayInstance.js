import razorpay from "razorpay"

// const razorpayInstanc = new razorpay({
//     key_id:process.env.RAZORPAY_KEY_ID,
//     key_secret:process.env.RAZORPAY_SECRET_KEY
// })

const createRazorpayInstance = () =>{
    return new razorpay({
        key_id:process.env.RAZORPAY_KEY_ID,
        key_secret:process.env.RAZORPAY_SECRET_KEY
    })
}
export {createRazorpayInstance}