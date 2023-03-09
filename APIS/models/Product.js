const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide product name!!!"],
      maxlength: [100, "name can't be more than 100 chars!!!"],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price!!!"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please provide product description!!!"],
      maxlength: [1000, "description can't be more than 1000 chars"],
    },
    image: {
      type: String,
      default: "uploads/example.jpeg",
      required: [true],
    },
    category: {
      type: String,
      required: [true, "Please provide product category!!!"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "Please provide product company!!!"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String],
      default: ["#222"],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
  //   match : property to populate reviews of a product based on a condition
});

const Review = require("../models/Review");
productSchema.pre("remove", async function () {
  const productId = this._id;
  await this.model("Review").deleteMany({ product: productId });
});

module.exports = new mongoose.model("Product", productSchema);
