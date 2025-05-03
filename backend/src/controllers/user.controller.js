import { AsyncHandler } from '../utils/AsyncHandler.js'
import { User } from '../models/user.model.js'
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from 'jsonwebtoken'
import sendEmail from "../utils/SendEmail.js"
import fs from "fs";

//login ma without method kari sakay pn multiple uses to making the Function.
const generateAccessTokenAndRefreshToken = async (userId) => {
   try {

      //on the bases of id storring the token..
      const user = await User.findById(userId)
      // console.log(user)
      //user k pass methods hai acesstoken and refreshtoken

      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()
      // console.log(accessToken)
      // console.log(refreshToken)
      // console.log(process.env.ACCESS_TOKEN_SECRET)
      //aa token madi gai so store in the db
      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return { accessToken, refreshToken }
   }
   catch (err) {
      throw new ApiError(500, "Something went Wrong")
   }

}

const registerUser = AsyncHandler(async (req, res, next) => {
   const { name, email, password } = req.body

   //  console.log('cnsle the boddy')
   //  console.log(req.body)
   //  console.log('cnsle the files')
   //  console.log(req.files)

   //valid - frontend se data aaya ki nhi

   if (!name || !email || !password) {
      throw new ApiError(400, "All feilds Must be required.")
   }

   //user already exist hai? ki
   const userExists = await User.findOne({ email })
   if (userExists) {
      throw new ApiError(400, "Error : User Ka account Already Hai User Exists.")
   }

   // const profilePicLocalPath = req.files?.profilePic?.[0]?.path;

    // Access the file buffer from memory storage
    const profilePicBuffer = req.files?.profilePic?.[0]?.buffer;

    if (!profilePicBuffer) {
        throw new ApiError(400, "Profile pic file is required.");
    }

    // Upload the buffer to Cloudinary
    const cloudinaryProfilePicUpload = await uploadOnCloudinary(profilePicBuffer, "profile_pic_" + Date.now());

   // const cloudinaryProfilePicUpload = await uploadOnCloudinary(profilePicLocalPath)



   if (!cloudinaryProfilePicUpload) {
      throw new ApiError(400, "ProfilePic must be required")
   }

   //for disk storage
   // // ✅ Delete the local profile pic after successful upload
   // if (fs.existsSync(profilePicLocalPath)) {
   //    fs.unlink(profilePicLocalPath, (err) => {
   //       if (err) console.error("Failed to delete local profile pic:", err);
   //       else console.log("Local profile pic deleted successfully.");
   //    });
   // }

   //db create

   const user = await User.create({
      name,
      profilePic: cloudinaryProfilePicUpload.url,
      email,
      password
   })



   const createdUser = await User.findById(user._id).select("-password")

   if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
   }
   const msg = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
      
      <h2 style="color: #4CAF50;">👋 Welcome to <span style="color: #2196F3;">TechSpeare</span> Sales & Services</h2>

      <p>Hi <strong>${name}</strong>,</p>
      
      <p>We’re excited to let you know that your account has been <strong>created successfully</strong>! 🎉</p>

      <p>Now you can easily explore our range of services and manage your bookings online.</p>

      <div style="margin: 20px 0; padding: 15px; background-color: #e8f5e9; border-left: 5px solid #4CAF50;">
        <strong>Your Message:</strong><br/>
        Welcome to TechSpeare Sales Services <strong>${name}</strong>, your account is created successfully.
      </div>

      <p>If you have any questions or need help, feel free to reach out to our support team.</p>

      <p style="margin-top: 30px;">Thanks for joining us,<br/><strong>— The TechSpeare Team</strong></p>
    </div>
  </div>
`;

   sendEmail({
      email: `${email}`,
      subject: "Account Created Successfully 🎉",
      message: msg,
   });

   res.status(200).json(new ApiResponse(201, createdUser, "User created successfully"));



})

const getAlluser = AsyncHandler(async (req, res) => {
   const user = await User.find({})
   if (!user) {
      throw new ApiError(400, "Not Found User")
   }
   res.status(200).json(new ApiResponse(200, user, "Getting All users"))
})


const loginUser = AsyncHandler(async (req, res) => {
   //req.body
   // user hai on the bases of username and email
   //find user
   //pass chk - false 
   //true -gen token
   //send cookie

   const { email, password } = req.body

   if (!email || !password) {
      throw new ApiError(400, "All feilds are required")
   }

   const user = await User.findOne({ email })

   if (!user) {
      throw new ApiError(400, "User not found")
   }

   //chk pass

   const isValidatePass = await user.isPasswordCorrect(password)
   if (!isValidatePass) {
      throw new ApiError(401, "Invalid User Credentials.")
   }

   // console.log(user)
   //gen token -for sending cookie token save karvi che user na db ma pn
   const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)
   // console.log(accessToken)
   // console.log(refreshToken)
   //send cookie option
   const option = {
      httpOnly: true, //only for reading not modefied by frontennd cookie -browser
      //server can modified cookie ,not frontend..
      secure: true,
   }

   //user ma mane passsword and refresh tokn nathi apva user can not see
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   res.status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", refreshToken, option)
      .json(
         new ApiResponse(
            200,
            {
               user: loggedInUser, refreshToken, accessToken
            },
            "Loggedin Successfully"
         )
      )



})


const logoutUser = AsyncHandler(async (req, res) => {
   //first db me user ka refresh tokens "" khali karo
   //cookies clear karo
   //user nahi he so making the middlewares... req.user auth se ..

   await User.findByIdAndUpdate(req.user._id, {
      $set: {
         refreshToken: undefined
      },
   }, { new: true })

   const option = {
      httpOnly: true,
      secure: true
   }

   return res.status(200)
      .clearCookie("accessToken", option)
      .clearCookie("refreshToken", option)
      .json(new ApiResponse(200, {}, "Logout Successfully"))

})


const refreshAccessToken = AsyncHandler(async (req, res, next) => {
   //token aai hase .. req.coookie,header se
   // verify and decode it user mile ga nd 
   //uske andr ka ref token match with the above token 
   // then new token gen..
   try {
      // console.log(req.cookies.refreshToken)


      const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

      if (!incomingRefreshToken) {
         throw new ApiError(400, "Unauthorized request...")
      }

      const decode = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

      const user = await User.findById(decode._id)
      if (!user) {
         throw new ApiError(400, "Invalid Refresh token")
      }

      //   console.log("incoming ref token")
      //   console.log(incomingRefreshToken)
      //   console.log("user k db ki ")
      //   console.log(user.refreshToken)

      if (incomingRefreshToken !== user.refreshToken) {
         throw new ApiError(400, "Invalid Refresh token or use.")
      }

      const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

      const option = {
         httpOnly: true,
         secure: true
      }
      res.status(200)
         .cookie("accessToken", accessToken, option)
         .cookie("refreshToken", refreshToken, option)
         .json(new ApiResponse(200, { user, accessToken, refreshToken }, " successfully Refresh Access Token"))

   } catch (error) {
      // throw new ApiError(400, error?.message ||"Error while access Invalid refressh token")
      return next(new ApiError(400, error?.message || "Error while refreshing access token"));
   }


})

const getCurrentUser = AsyncHandler(async (req, res, next) => {
   const user = req.user //login bnda hoga so mil jayega token se
   res.status(200).json(new ApiResponse(200, { user }, "Getting The current user."))
})

const updatePassword = AsyncHandler(async (req, res, next) => {
   const { oldPassword, newPassword } = req.body
   // console.log("user console")
   console.log(req.user)
   // console.log(req.user._id)
   console.log(req.body)
   console.log(oldPassword, newPassword)

   const user = await User.findById(req.user._id)
   if (!user) {
      throw new ApiError(400, "User not found.Pls login.")
   }

   if (!oldPassword || !newPassword) {
      throw new ApiError(400, "Old password and new password Both feild required")
   }
   //match the old password



   const isValidOldPass = await user.isPasswordCorrect(oldPassword)

   if (!isValidOldPass) {
      throw new ApiError(400, "Please Enter Correct Old Password")
   }
   user.password = newPassword
   const updatedPassUser = await user.save({ validateBeforeSave: false })

   res.status(200).json(new ApiResponse(200, updatedPassUser, "Password updated successfully."))


})

const updateUserAccountDetails = AsyncHandler(async (req, res, next) => {
   const { name, email } = req.body

   if (!name || !email) {
      throw new ApiError(400, "Error: Name and Email required While update.")
   }

   //new :true must required km k j update thse te navi rite store thase.
   const user = await User.findByIdAndUpdate(req.user._id, {
      $set: {
         name: name,
         email: email
      }
   }, { new: true }).select("-password")

   res.status(200).json(new ApiResponse(200, user, "Upadated Successfully ."))

})

const updateProfilePic = AsyncHandler(async (req, res, next) => {
   const profilePicLocalPath = req.file?.path
   // console.log(req.file)
   if (!profilePicLocalPath) {
      throw new ApiError(400, "Profile File is Required")
   }
   const profilePicUpload = await uploadOnCloudinary(profilePicLocalPath)

   if (!profilePicUpload) {
      throw new ApiError(400, "Error While uploading Profile File")
   }

   const user = await User.findByIdAndUpdate(req.user._id, {
      $set: {
         profilePic: profilePicUpload.url
      }
   }
      , { new: true }).select("-password")

   res.status(200).json(new ApiResponse(200, user, "Profilepic File Updateed successfully"))

})

const deleteUser = AsyncHandler(async (req, res, next) => {
   // console.log(req.user._id)
   const { id } = req.params;
   const user = await User.findByIdAndDelete(id)
   if (!user) {
      throw new ApiError(400, "Something Went wrong or User Already dlted.")
   }
   res.status(200).json(new ApiResponse(200, {}, "User Deleted successfully"))

})

export {
   registerUser,
   getAlluser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   getCurrentUser,
   updatePassword,
   updateUserAccountDetails,
   updateProfilePic,
   deleteUser
}