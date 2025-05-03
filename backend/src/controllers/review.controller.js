import { Product } from "../models/product.models.js";
import { Review } from "../models/review.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

// Add Single Review
const addReview = AsyncHandler(async (req, res) => {
  const { userId, productId, comment, rating } = req.body;

  if (!userId || !productId || !comment || !rating) {
    throw new ApiError(400, "Please provide all review details.");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  const existingReview = await Review.findOne({ userId, productId });
  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this product.");
  }

  const newReview = await Review.create({ userId, productId, comment, rating });

  const reviews = await Review.find({ productId });
  product.numOfReviews = reviews.length;
  product.averageRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
  ).toFixed(1);

  await product.save();

  res
    .status(201)
    .json(new ApiResponse(201, newReview, "Review added successfully."));
});

// ✅ Add Multiple Reviews (NEW)
const addMultipleReviews = AsyncHandler(async (req, res, next) => {
  const { userId, reviews } = req.body;  // reviews is an array of {productIds, comment, rating}

  if (!userId || !Array.isArray(reviews) || reviews.length === 0) {
    throw new ApiError(400, "Please provide userId and an array of product reviews.");
  }

  const newReviews = [];

  for (const reviewData of reviews) {
    const { productIds, comment, rating } = reviewData;

    if (!Array.isArray(productIds) || !productIds.length || !comment || !rating) {
      throw new ApiError(400, "Missing required fields in one of the reviews.");
    }

    // Ensure each productId is valid
    const products = await Product.find({ '_id': { $in: productIds } });
    if (products.length !== productIds.length) {
      throw new ApiError(404, "One or more products not found.");
    }

    // Optional: Prevent duplicate reviews by the same user for the same product
    const existingReviews = await Review.find({ userId, productId: { $in: productIds } });
    if (existingReviews.length > 0) {
      throw new ApiError(400, "You have already reviewed one or more of these products.");
    }

    const newReview = await Review.create({
      userId,
      productId: productIds, // storing multiple productIds
      comment,
      rating
    });

    newReviews.push(newReview);

    // Recalculate product ratings for each product
    for (const productId of productIds) {
      const reviewsForProduct = await Review.find({ productId });
      const product = await Product.findById(productId);

      product.numOfReviews = reviewsForProduct.length;
      product.averageRating = (
        reviewsForProduct.reduce((acc, r) => acc + r.rating, 0) / reviewsForProduct.length
      ).toFixed(1);

      await product.save();
    }
  }

  res.status(201).json(new ApiResponse(201, newReviews, "Reviews added successfully."));
});

  

// Get All Reviews
const getAllReview = AsyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .populate("userId", "name email")
    .populate("productId", "productName");

  const totalReview = await Review.countDocuments();

  if (!reviews.length) {
    throw new ApiError(404, "No reviews found.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, { totalReview, reviews }, "Fetched all reviews."));
});

// Get Reviews for a Specific Product
const getReviewByProductId = AsyncHandler(async (req, res) => {
  const { productId } = req.params;

  const reviews = await Review.find({ productId }).populate("userId", "name email");

  if (!reviews.length) {
    throw new ApiError(404, "No reviews found for this product.");
  }
  console.log(reviews)

  res
    .status(200)
    .json(new ApiResponse(200, reviews, "Fetched product reviews."));
});

// Delete Review
const dltReview = AsyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const deletedReview = await Review.findByIdAndDelete(reviewId);
  if (!deletedReview) {
    throw new ApiError(404, "Review not found.");
  }

  const reviews = await Review.find({ productId: deletedReview.productId });
  const product = await Product.findById(deletedReview.productId);

  product.numOfReviews = reviews.length;
  product.averageRating = reviews.length
    ? (
        reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      ).toFixed(1)
    : 0;

  await product.save();

  res
    .status(200)
    .json(new ApiResponse(200, deletedReview, "Review deleted successfully."));
});

// Update Review
const updateRev = AsyncHandler(async (req, res) => {
  const { userId, reviewId } = req.params;
  const { comment, rating } = req.body;

  if (!userId || !reviewId) {
    throw new ApiError(400, "User ID and Review ID are required.");
  }

  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    { comment, rating },
    { new: true }
  );

  if (!updatedReview) {
    throw new ApiError(404, "Review not found.");
  }

  const product = await Product.findById(updatedReview.productId);
  const reviews = await Review.find({ productId: updatedReview.productId });

  product.numOfReviews = reviews.length;
  product.averageRating = reviews.length
    ? (
        reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      ).toFixed(1)
    : 0;

  await product.save();

  res
    .status(200)
    .json(new ApiResponse(200, updatedReview, "Review updated successfully."));
});

export {
  addReview,
  addMultipleReviews, // Export the new bulk review function
  getAllReview,
  getReviewByProductId,
  dltReview,
  updateRev
};
