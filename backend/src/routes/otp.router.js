import { sendOtp,verifyOtp,resetPassword } from "../controllers/otp.controller.js";

import express from "express"
const router= express.Router();

//Forget pass routes

router.route("/sendOtp").post(sendOtp);
router.route("/verifyOtp").post(verifyOtp);
router.route("/resetPass").post(resetPassword)

export default router