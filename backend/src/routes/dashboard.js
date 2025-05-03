import { getDashboardStats } from "../controllers/dashbord.controller.js";

import express from "express"
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";
const router = express.Router()

router.route("/getDashboard").get(verifyJwt,isAdmin, getDashboardStats)

export default router