import { isAdmin } from "../../middlewares/isAdmin.middleware.js";
import {verifyJwt} from "../../middlewares/auth.middleware.js"

import express from "express"
import { createUserService, getMyService, gettingAllCategories, gettingAllNotification, gettingCancleNotification, gettingCategoriesService, gettingCompleteNotification, gettingScheduleNotfication } from "../../controllers/service/userService.controller.js";
import { cancleUserSevice, completeServiceUser, createServiceSubCategories, getAllServiceUser, getSingleUserService, removeSubCategory, reScheduleUserService } from "../../controllers/service/adminService.js";

const router=express.Router();

//User side
router.route("/createUserService/:categoryName").post(verifyJwt,createUserService)
router.route("/gettingCategories/:name").get(verifyJwt,gettingCategoriesService)
router.route("/getAllCategories").get(verifyJwt,gettingAllCategories)

router.route("/getScheduleNotification/:id").get(verifyJwt,gettingScheduleNotfication)

router.route("/getCompleteNotification/:id").get(verifyJwt,gettingCompleteNotification)
router.route("/getCancleNotification/:id").get(verifyJwt,gettingCancleNotification)
router.route("/getAllNotification/:id").get(verifyJwt,gettingAllNotification)

router.route("/getMyService").get(verifyJwt,getMyService)

//Admin side
router.route("/createCategories").post(verifyJwt,isAdmin,createServiceSubCategories)
router.route("/dltSubCategory").delete(removeSubCategory)

router.route("/reScheduleService").post(verifyJwt,isAdmin,reScheduleUserService)
router.route("/getAllServiceUser").get(verifyJwt,isAdmin,getAllServiceUser)
router.route("/getSingleServiceUser/:id").get(verifyJwt,isAdmin,getSingleUserService)

router.route("/completeService/:userId").post(verifyJwt,isAdmin,completeServiceUser)
router.route("/cancleService/:userId").post(verifyJwt,isAdmin,cancleUserSevice)

export default router
