import express from 'express'
import { deleteOrder, getAllOrders, getMyOrdersLoggInUser, getSingleOrder, newOrder, trackingOrders, updateOrderStatus } from '../controllers/order.controller.js'
import {isAdmin} from "../middlewares/isAdmin.middleware.js"
import { verifyJwt } from '../middlewares/auth.middleware.js'

const router= express.Router()
//helth chk
router.route("/chk").post((req,res,next)=>{ res.json("done")  })

//Creating the orders -user
router.route("/newOrder").post(verifyJwt,newOrder)
router.route("/getMyOrder").get(verifyJwt,getMyOrdersLoggInUser)
router.route("/trackOrder/:id").get(verifyJwt,trackingOrders)


//Only for admins 
router.route("/getAllOrders").get(verifyJwt, isAdmin,getAllOrders)
router.route("/updateOrderStatus/:orderId").patch(verifyJwt,isAdmin,updateOrderStatus)
router.route("/getSingleOrder/:id").get(verifyJwt,isAdmin,getSingleOrder)
router.route("/dltOrder/:id").delete(verifyJwt,isAdmin,deleteOrder)

export default router