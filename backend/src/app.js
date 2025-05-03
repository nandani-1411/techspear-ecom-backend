import express from 'express'
import cors from 'cors'
// import {userRouter} from "./routes/user.router.js"
import cookieParser from "cookie-parser"
import { ApiResponse } from './utils/ApiResponse.js'
import sendEmail from './utils/SendEmail.js'
import userRouter from './routes/user.router.js'
import productRouter from "./routes/product.router.js"
import orderRouter from "./routes/order.router.js"
import cartRouter from "./routes/cart.router.js"
import addressRouter from "./routes/address.router.js"
import reviewRouter from "./routes/review.router.js"
import bannerRouter from "./routes/banner.router.js"
import serviceRouter from "./routes/service/service.router.js"
import paymentRouter from "./routes/payment.router.js"
import dashboardRouter from "./routes/dashboard.js"
import forgetRouter from "./routes/otp.router.js"

import { ApiError } from './utils/ApiError.js'
import { upload } from './middlewares/multer.middleware.js'

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders:["Content-Type","Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
}))



app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});


app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))

app.use(express.static("public"))

app.use("/api/v1/users",userRouter)
app.use("/api/v1/products",productRouter)
app.use("/api/v1/orders",orderRouter)
app.use("/api/v1/cart",cartRouter)
app.use("/api/v1/address",addressRouter)
app.use("/api/v1/review",reviewRouter)
app.use("/api/v1/banner",bannerRouter)
app.use("/api/v1/service",serviceRouter)
app.use("/api/v1/payment",paymentRouter)
app.use("/api/v1/dashboard",dashboardRouter)
app.use("/api/v1/forgetPass",forgetRouter)
// any error 
// app.use((err,req,res,next)=>{
//     throw new ApiError(400,err)
// })
app.use(upload.any())
app.use((err, req, res, next) => {
    console.error("Error Middleware Caught:", err);
 
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
 
    res.status(statusCode).json({
       success: false,
       statusCode,
       message,
       errors: err.errors || [],
    });
 });

app.get("/",(req,res,next)=>{
    res.send({
        success:true,
        message:"Techspeare is running."
    })
})

 // Contact Us Route and Handler
app.post("/contactus", async (req, res, next) => {
    const { firstName, lastName, email, message } = req.body;

    // Log the request body to check if it's being sent properly
    console.log("HI");
    console.log(req.body);

    // Validate the data
    if (!firstName || !lastName || !email || !message) {
        throw new ApiError(400, "All fields are required.");
    }

    try {
        // Send email (You can modify the `sendEmail` function accordingly)
        await sendEmail({
            email: process.env.SMTP_EMAIL, // SMTP email for the recipient
            subject: "Contact Us",
            message: `User ${firstName} ${lastName} has contacted you. Message: ${message}`,
        });

        // Send response
        res.status(200).json(new ApiResponse(200, {}, "Message sent successfully."));
    } catch (error) {
        console.error("Error sending email:", error);
        throw new ApiError(500, "There was an issue sending the email.");
    }
});
 

//error aaye tab ye runnig...
app.on("error", (err) => {
    console.log("Server error : " + err)
    throw err
})

export default app
