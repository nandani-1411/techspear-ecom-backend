import { Otp } from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import sendEmail from "../utils/SendEmail.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

// Controller to send OTP
export const sendOtp = AsyncHandler(async (req, res, next) => {
  const { email } = req.body;

  console.log("From send otp ")
  console.log(email)
  // Check if user exists
  const user = await User.findOne({ email });
  console.log(user)
  if (!user) {
    // return new ApiError(404, "User not found");
    
    return next(new ApiError(404, "User not found"));
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP to the database with expiration time (5 minutes)
  await Otp.create({ email, otp });

  // Send OTP via email
  await sendEmail({
    email,
    subject: "OTP for Password Reset",
    message: `Your OTP is: ${otp}`,
  });

  res.status(200).json(new ApiResponse(200, {}, "OTP has been sent to your email."));
});

// Controller to verify OTP
export const verifyOtp = AsyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  console.log(email,otp)
  

  // Find OTP record in the database
  const otpRecord = await Otp.findOne({ email, otp });
  console.log(otpRecord)
  if (!otpRecord) {
    return next(new ApiError(404, "Invalid or Expireed Otp."));
  }

  // Optionally delete OTP after verification
  await Otp.deleteMany({ email });

  res.status(200).json(new ApiResponse(200, {}, "OTP verified successfully."));
});

// Controller to reset password
export const resetPassword = AsyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  // Update the user's password (no need to hash as password is already hashed when saving)
  user.password = newPassword; // Just set the new password here
  await user.save();

  res.status(200).json(new ApiResponse(200, {}, "Password reset successful"));
});
