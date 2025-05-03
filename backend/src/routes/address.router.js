import express from "express"
import { addAddress, deleteAddress, getAddress, updateAddress } from "../controllers/address.controller.js"
import {verifyJwt} from "../middlewares/auth.middleware.js"
const router = express.Router()

router.route("/chk").get((req,res,next)=>{
    res.json("Done Working.")
})

router.route("/addAddress").post(verifyJwt,addAddress)
router.route("/getAddress/:userId").get(verifyJwt,getAddress)
router.route("/updateAddress/:userId/:addressId").patch(verifyJwt,updateAddress)
router.route("/deleteAddress/:userId/:addressId").delete(verifyJwt,deleteAddress)

export default router