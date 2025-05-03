import express from "express"
import { addBannerImg, deleteBannerImg, getBannerImg } from "../controllers/banner.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router= express.Router()

//Only admin is able to addBanner,dltbnner

router.route("/addBanner").post(verifyJwt,isAdmin,upload.fields([
    {
        name:"img",
        maxCount:8
    }
]),addBannerImg)

router.route("/deleteBanner/:bannerId").delete(verifyJwt,isAdmin,deleteBannerImg)
router.route("/getBanner").get(getBannerImg)

export default router