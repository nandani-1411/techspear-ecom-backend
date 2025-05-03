import { AsyncHandler } from "../../utils/AsyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"
import { ApiResponse } from "../../utils/ApiResponse.js"
import UserService from "../../models/service/userService.js";
import ServiceCategory from "../../models/service/serviceCategories.js";
import sendEmail from "../../utils/SendEmail.js";
import ServiceNotification from "../../models/service/serviceMsg.js";

const createUserService = AsyncHandler(async (req, res, next) => {
    const {categoryName}=req.params
    console.log(categoryName)
    console.log(req.body)

    if(!categoryName){
        throw new ApiError(400,"Category Name is Required")
    }

    const categories= await ServiceCategory.findOne({name:categoryName})

    if(!categories){
        throw new ApiError(400,"Categories not Found.")
    }

    const { addressInfo, scheduleTime ,date ,subCategories} = req.body;

    if ( !addressInfo || !scheduleTime || !date || !subCategories) {
        throw new ApiError(400, "All fields must be required Here.")
    }

    if(!categories.subCategories.includes(subCategories)){
        throw new ApiError(400,"Not match the SubCategories wrong subcategories.")
    }

    const createUserService = await UserService.create({
        userId:req.user._id,
        name:req.user.name,
        email:req.user.email,
        addressInfo,
        scheduleTime,
        date,
        subCategories
    })

    const emailMessage = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <h2 style="color: #4CAF50;">📦 Service Request Received</h2>
        <p>Hi <strong>${req.user.name}</strong>,</p>
        <p>Thank you for booking a service with us! 🙌</p>
        <p>Here’s a quick summary of your request:</p>
        <ul>
          <li><strong>Category:</strong> ${categoryName}</li>
          <li><strong>Sub-Category:</strong> ${subCategories}</li>
          <li><strong>Scheduled Time:</strong> ${scheduleTime}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Service Info :</strong> ${addressInfo}</li>
        </ul>
  
        <p><strong>📢 Please bring your product to our store at the scheduled date and time.</strong></p>
        <p>Our technicians will begin the service once we receive your device.</p>
  
        <p style="margin-top: 20px;"><strong>📍 Store Address:</strong><br>
        TechFix Center,<br>
        123 Service Street,<br>
        Cityville, 456789<br>
        📞 +91-9876543210</p>
  
        <p>We’ve received your request and our team will get back to you shortly to confirm the schedule.</p>
        <p>Feel free to reach out if you have any questions!</p>
  
        <br />
        <p style="color: #555;">Best regards,<br><strong>Your Service Team</strong></p>
        <hr />
        <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `;
  

    await sendEmail({
        email: req.user.email,
        subject: "✅ Service Request Received",
        message: emailMessage
    })

    res.status(200).json(new ApiResponse(200, createUserService, "User Service Only Created"))

})

//getting all categories

const gettingCategoriesService=AsyncHandler(async(req,res,next)=>{
    const {name}=req.params;
    console.log(name)
    const categories= await ServiceCategory.find({name}).lean();
    if(categories.length===0){
        throw new ApiError(200,"Not found with that name categories")
    }
    res.status(200).json(new ApiResponse(200,categories))
})

const gettingAllCategories=AsyncHandler(async (req,res,next)=>{
    const categories = await ServiceCategory.find({})
    res.status(200).json(new ApiResponse(200,categories,"Getting subCategories"))
})

//getting schedule notification

const gettingScheduleNotfication =AsyncHandler(async(req,res,next)=>{    
    const {id}=req.params;
    const user = await ServiceNotification.find({user:id,status:"ReSchedule"})
    if(user.length===0){
        throw new ApiError(400,"Not found any notification with that user id")
    }

    res.status(200).json(new ApiResponse(200,user,"Getting User Notication Messages."))

})

const gettingCancleNotification=AsyncHandler(async(req,res,next)=>{
    const {id} =req.params;

    const notify =await ServiceNotification.find({user:id,status:"Cancel"})

    if(notify.length===0){
        throw new ApiError(400,"Not found with that user id")
    }

    res.status(200).json(new ApiResponse(200,notify,"Geting msg."))

})

const gettingCompleteNotification=AsyncHandler(async(req,res,next)=>{
    const {id} =req.params;

    const notify =await ServiceNotification.find({user:id,status:"Complete"})

    if(notify.length===0){
        throw new ApiError(400,"Not found with that user id")
    }

    res.status(200).json(new ApiResponse(200,notify,"Geting msg."))

})

const gettingAllNotification=AsyncHandler(async(req,res,next)=>{

    const {id}=req.params;
    console.log(id)
    const allnotify= await ServiceNotification.find({user:id}).lean()

    if(allnotify.length===0){
        throw new ApiError(400,"No Notification Are Available")
    }

    res.status(200).json(new ApiResponse(200,allnotify,"Getting All Notification."))


})

const getMyService = AsyncHandler(async(req,res,next)=>{
    const userId= req.user._id;
    const service = await UserService.find({userId:userId}).populate("userId","name email")

    if(service.length===0){
        throw new ApiError(400,"Service not found")
    }

    res.status(200).json(new ApiResponse(200,service,"Getting My Service."))


})

export {
    createUserService,
    gettingCategoriesService,
    gettingAllCategories,
    gettingScheduleNotfication,
    gettingCancleNotification,
    gettingCompleteNotification,
    gettingAllNotification,
    getMyService
}