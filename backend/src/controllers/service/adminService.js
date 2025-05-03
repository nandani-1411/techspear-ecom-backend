import { AsyncHandler } from '../../utils/AsyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import ServiceCategory from '../../models/service/serviceCategories.js';
import ServiceNotification from '../../models/service/serviceMsg.js';
import ServiceSchedule from '../../models/service/serviceSchedule.js';
import sendEmail from "../../utils/SendEmail.js"
import UserService from '../../models/service/userService.js';
import { User } from '../../models/user.model.js';


//Creating the Service Categories and SubCategories

const createServiceSubCategories = AsyncHandler(async (req, res, next) => {
    const { name, subCategories } = req.body;

    if (!name || !subCategories) {
        throw new ApiError(400, "All feilds are required")
    }

    let existingCategories = await ServiceCategory.findOne({ name })
    if (existingCategories) {
        existingCategories.subCategories = [...existingCategories.subCategories, subCategories]

        await existingCategories.save()
    }

    else {
        existingCategories = await ServiceCategory.create({
            name,
            subCategories
        })
    }


    res.status(200).json(new ApiResponse(201, existingCategories, "Categories are Created"))

})

// Remove SubCategories

const removeSubCategory = AsyncHandler(async (req, res, next) => {

    const { name, subCategories } = req.body
    console.log(req.body)
    if (!name || !subCategories) {
        throw new ApiError(400, "Rquired Fild must Name , SubCategories")
    }
    const categories = await ServiceCategory.findOne({ name })
    if (!categories) {
        throw new ApiError(400, "Category Not found with that name.")
    }

    if (!categories.subCategories.includes(subCategories)) {
        throw new ApiError(400, "Category is Not Found Or already dlted.")
    }

    // console.log(categories.subCategories)
    // console.log(name)
    // console.log(subCategories)

    categories.subCategories = categories.subCategories.filter((cat) => cat !== subCategories)

    await categories.save()
    console.log(categories)

    res.status(200).json(new ApiResponse(200, categories, "Dlted successfully"))

})

const reScheduleUserService = AsyncHandler(async (req, res, next) => {
    //here that is the appoinment id = userid  nhi hai appoinment id pssing bcz multiple user can book multiple service so pass the appoinmnt id for unique identification
    const { time, date, apppoinmentId } = req.body;

    if (!time || !date || !apppoinmentId) {
        throw new ApiError(400, "All Required Feilds Pls Provide it for Reschedule Service (time,date,userId)")
    }
    const reschdule = await ServiceSchedule.create({
        user: apppoinmentId,
        time,
        date
    })
    // console.log(reschdule)

    // const user= await ServiceSchedule.findOne({user:userId}).populate("user")
    // if(!user){
    //     throw new ApiError(400,"Invalid User Service")
    // }
    // user.user.status="ReSchedule";
    // await user.save()
    // console.log(`user ${user}`)

    const updtInsStatus = await UserService.findById(apppoinmentId).populate("userId")

    updtInsStatus.scheduleTime = time;
    updtInsStatus.date = date;
    updtInsStatus.status = "ReSchedule"

    await updtInsStatus.save()
    console.log("my", updtInsStatus)

    console.log("USERname ", updtInsStatus?.userId?.name)
    console.log("EMail ", updtInsStatus?.userId?.email)
    let usr = updtInsStatus?.userId?.name;
    let email = updtInsStatus?.userId?.email;


    const msg = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #4CAF50;">Service Rescheduled</h2>
        <p>Dear <strong>${usr}</strong>,</p>
        <p>Your service has been <strong>rescheduled</strong> by the admin. Please find the updated details below:</p>
  
        <ul style="list-style: none; padding-left: 0;">
          <li><strong>🗓️ New Date:</strong> ${date}</li>
          <li><strong>⏰ New Time:</strong> ${time}</li>
        </ul>
  
        <p>If you have any questions or need to reschedule again, please contact our support team.</p>
        <p style="margin-top: 30px;">Thank you for choosing our service!<br>– The Team</p>
      </div>
    </div>
  `;

    sendEmail({
        email: email,
        subject: "🔄 Your Service Has Been Rescheduled",
        message: msg
    });


    const notify = await ServiceNotification.create({
        user: apppoinmentId,
        message: `Your Service Has Been Rescheduled : Date is ${date} and Time is ${time}`,
        status: "ReSchedule"
    })

    res.status(201).json(new ApiResponse(200, { updatedUserService: updtInsStatus, reschdule, notify }, "Sending the msg of reschedule"))
})

const completeServiceUser = AsyncHandler(async (req, res, next) => {
    const { userId } = req.params;

    const user = await UserService.findById(userId);

    if (!user) {
        throw new ApiError(400, "User Not found with that ID");
    }

    user.status = "Complete";
    await user.save();

    const msg = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #4CAF50;">✅ Service Completed</h2>
      <p>Dear <strong>${user.name}</strong>,</p>
      <p>We’re pleased to let you know that your service has been <strong>successfully completed</strong>.</p>

      <p>Your device is now ready for pickup. Please visit our store during working hours to collect your product.</p>

      <ul style="list-style: none; padding-left: 0;">
        <li><strong>📍 Store Address:</strong> [Your Store Address Here]</li>
        <li><strong>🕒 Timings:</strong> 10:00 AM – 7:00 PM</li>
      </ul>

      <p>If you have any questions or need further assistance, feel free to reach out to our support team.</p>

      <p style="margin-top: 30px;">Thank you for choosing our service!<br>– The Team</p>
    </div>
  </div>
`;


    const notify = await ServiceNotification.create({
        user: userId,
        message: `Dear User ${user.name} Your Service is Complete. Thank You for visit our shop.`,
        status: "Complete"
    });

    await notify.save();

    sendEmail({
        email: user.email,
        subject: "🎉 Your Service is Completed!",
        message: msg
    });

    res.status(200).json(new ApiResponse(200, { user, notify }, "User Service is complete"));
});


const cancleUserSevice = AsyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const user = await UserService.findById(userId);

    if (!user) {
        throw new ApiError(400, "User Not Found");
    }

    user.status = "Cancel";
    await user.save();

    const msg = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fefefe; color: #333;">
        <div style="max-width: 600px; margin: auto; background-color: #fff3f3; padding: 30px; border-radius: 8px; border: 1px solid #f44336;">
          <h2 style="color: #f44336;">⚠️ Service Cancelled</h2>
          <p>Dear <strong>${user.name}</strong>,</p>
          <p>We regret to inform you that your requested service has been <strong>cancelled by the admin</strong>.</p>
          <p>If you believe this was a mistake or wish to reschedule, you can make a new service request through our platform.</p>
          <p style="margin-top: 30px;">Thank you for your understanding,<br>– The Team</p>
        </div>
      </div>
    `;

    const notify = await ServiceNotification.create({
        user: userId,
        message: `Dear User ${user.name} Your Service has been Cancelled By Admin. Please place a new service order if needed.`,
        status: "Cancel"
    });

    await notify.save();

    sendEmail({
        email: user.email,
        subject: "⚠️ Service Cancellation Notice",
        message: msg
    });

    res.status(200).json(new ApiResponse(200, { user, notify }, "Cancelling User Service."));
});


const getAllServiceUser = AsyncHandler(async (req, res, next) => {

    const allServiceUser = await UserService.find({}).populate("userId", "name email")

    if (allServiceUser.length === 0) {
        throw new ApiError(400, "Not found user.")
    }
    console.log(allServiceUser)

    res.status(200).json(new ApiResponse(200, allServiceUser, "Getting all service users."))

})

const getSingleUserService = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const singleUser = await UserService.findById(id);
    if (!singleUser) {
        throw new ApiError(400, "Not founded single user service")
    }
    res.status(200).json(new ApiResponse(200, singleUser, "Getting the single user."))
})

export {
    createServiceSubCategories,
    removeSubCategory,
    reScheduleUserService,
    getAllServiceUser,
    getSingleUserService,
    completeServiceUser,
    cancleUserSevice
}