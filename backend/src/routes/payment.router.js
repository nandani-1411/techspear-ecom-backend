import express from "express"
import { createCODPayment, createPayment, getAllPayment, getUserCODPayments, getUserPayment, verifyPayment } from "../controllers/payment.controller.js"

const router= express.Router()

router.post("/createPayment",createPayment);
router.post("/verifyPayment",verifyPayment);
router.get("/allPayments", getAllPayment)
router.get("/userPayment/:userId", getUserPayment)

router.post("/createCod",createCODPayment);
router.get("/allCod",getAllPayment)
router.get("/userCod/:userId",getUserCODPayments)

export default router