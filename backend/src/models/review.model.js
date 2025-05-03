import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  // User who submitted the review
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Product(s) being reviewed (modified to handle multiple products)
  productId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  }],

  // Review comment
  comment: {
    type: String,
    required: true,
    trim: true
  },

  // Rating between 1 to 5
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Create and export model
const Review = mongoose.model("Review", reviewSchema);
export { Review };
