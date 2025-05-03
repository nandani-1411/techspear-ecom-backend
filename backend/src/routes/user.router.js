import express from "express"
const router = express.Router()
import { upload } from '../middlewares/multer.middleware.js'
import {isAdmin} from "../middlewares/isAdmin.middleware.js"
import {
    registerUser,
    getAlluser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updatePassword,
    updateUserAccountDetails,
    updateProfilePic,
    getCurrentUser,
    deleteUser
} from "../controllers/user.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"

router.route("/register").post(upload.fields([
    {
        name: "profilePic",
        maxCount: 1
    }
]), registerUser)


// router.post("/login",loginUser) 
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJwt, logoutUser)
router.route("/refreshToken").post(refreshAccessToken)

router.route("/getAllUser").get(verifyJwt,isAdmin,getAlluser) //**adminroute
router.route("/getCurrentUser").get(verifyJwt, getCurrentUser)
router.route("/updatePass").patch(verifyJwt, updatePassword)
router.route("/updateDetails").patch(verifyJwt, updateUserAccountDetails)
router.route("/updateProfilePic").patch(verifyJwt, upload.single("profilePic"), updateProfilePic)

router.route("/deleteUser/:id").delete(verifyJwt,isAdmin,deleteUser) //**adminroute



export default router