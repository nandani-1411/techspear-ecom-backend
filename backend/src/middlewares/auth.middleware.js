import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";


export const verifyJwt = async(req,_,next)=>{

    //token aave che .. chk
    //decode it -verify it
    //req.user me store it

    try {
        const token= req.cookies?.accessToken ||req.header("Authorization")?.replace("Bearer ", "")
    
        // console.log("token")
        // console.log(req.cookies.accessToken)
        if(!token){
            // throw new ApiError(400,"Unauthorized Request .")
            return next(new ApiError(400,"Unauthorized Requrest."))
        }
    
        //decode it object mdse ..user no data on bases of acess token
    
        const decode = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        //data storing into user
        
        const user =await User.findById(decode._id)
        if(!user){
            return next(new ApiError(400,"Invalid Access token")) 
        }
        
        req.user=user
    
        next() //bcz other function will running
    } catch (error) {
        
        if (error.name === "TokenExpiredError") {
            return next(new ApiError(401, "Access token has expired. Please log in again."));
        }
        return next(new ApiError(400,error.message || "Invalid Access Token"))
        
    }

}