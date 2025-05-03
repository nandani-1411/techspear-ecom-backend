import express from "express";
import { addReview, dltReview, getAllReview, getReviewByProductId, updateRev, addMultipleReviews } from "../controllers/review.controller.js"; // <-- addMultipleReviews import here
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";

const router = express.Router();

// Add review for a single product
router.route("/addReview").post(verifyJwt, addReview);

// Add reviews for multiple products
router.route("/addMultipleReviews").post(verifyJwt, addMultipleReviews); // <-- Add this route

// Update review by userId and reviewId
router.route("/updateReview/:userId/:reviewId").patch(verifyJwt, updateRev);

// Delete review (admin or user who created it)
router.route("/deleteReview/:reviewId").delete(verifyJwt, dltReview);

// Admin can access all reviews
router.route("/getAllReview").get(verifyJwt, isAdmin, getAllReview);

// Getting reviews by productId (for visitors and users)
router.route("/getUserReview/:productId").get(getReviewByProductId);

export default router;
