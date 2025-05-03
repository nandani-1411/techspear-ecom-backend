import { Address } from "../models/address.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const addAddress = AsyncHandler(async (req,res,next)=>{

    const { userId,fullAddress,state,city,country,pinCode ,apartment, email,phone}= req.body
    console.log(req.body)

    
    if (!userId || !fullAddress || !state || !city || !country || !pinCode || !apartment || !phone || !email) {
        console.log("Missing fields:", { userId, fullAddress, state, city, country, pinCode, apartment, phone, email });
        throw new ApiError(400, "Fulladdress, state, city, country, pincode, apartment All required");
    }


    const address= await Address.create({
        userId,
        fullAddress,
        state,
        city,
        country,
        pinCode,
        apartment,
        phone,
        email
    })

    res.status(201).json(new ApiResponse(200,address,"Address successfully added."))


})

const updateAddress = AsyncHandler(async (req,res,next)=>{

    const { userId ,addressId} = req.params
    const data= req.body
    // console.log(data)

    if(!userId || !addressId){
        throw new ApiError(400,"UserId and AddressId required")
    }

    if(!data){
        throw new ApiError(400,"Data must be required for updating")
    }

    const address=await Address.findByIdAndUpdate({
        _id:addressId,
        userId
    },data,{new:true})

    if(!address){
            throw new ApiError(400,"Address not found")
    }

    res.status(200).json(new ApiResponse(200,address,"Updated Adddress"))

})
const deleteAddress = AsyncHandler(async (req,res,next)=>{

    const {userId,addressId}= req.params

    if(!userId || !addressId){
        throw new ApiError(400,"UserId and AddressId required.")
    }

    const dltAddress= await Address.findByIdAndDelete({_id:addressId,userId})
    if(!dltAddress){
        throw new ApiError(400,"Already Dlted")
    }

    res.status(200).json(new ApiResponse(200,{},"Deleted Successfullly."))

})
const getAddress = AsyncHandler(async (req,res,next)=>{

    const {userId}= req.params
    console.log(userId)

    if(!userId){
        throw new ApiError(400,"UserId required.")
    }


    // const address= await Address.find({userId})
    const address= await Address.findOne({userId})

    
    if(!address){
        throw new ApiError(400,"Addres not found")
    }

    //bcaz find method will give an array ...
    // if(address.length===0){
    //     throw new ApiError(400,"Address not found")
    // }

    res.status(200).json(new ApiResponse(200,address,"Getting alll the adddresses."))
    
})


export {
    addAddress,
    updateAddress,
    deleteAddress,
    getAddress
}