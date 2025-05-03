import { ApiError } from "../utils/ApiError.js"

const isAdmin =async(req,res,next)=>{
    
   try{
     //user login hoga tab hi chk krenge..
     const user =req.user;

     if(!user){
        return next(new ApiError(401,"Unauthenticted Request. Please Login..."))
     }
 
     //admin hase to next () function call aagd no access aapi do...
     if(user.role==="Admin"){
         next()
     }
     else{
        return next(new ApiError(401,"Unauthorized Role Only Admins are allow"))
     }
   }
   catch(er){
    return next(new ApiError(401,er.message || "Something went wrong in admin middlwre"))
   }

}

export {isAdmin}