const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide product rating!!!"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide product review title!!!"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide product review text!!!"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide userId!!!"],
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: [true, "Please provide productId!!!"],
    },
  },
  { timestamps: true }
);

// a single user can write only one reivew on a product[IDK how this is working but will figure out super soon :)]
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (!("averageRating" in result[0])) result[0].averageRating = 0;

    if (!("numOfReviews" in result[0])) result[0].numOfReviews = 0;
    console.log({ "xxx": result[0].numOfReviews });

    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0].averageRating),
        numOfReviews: result[0].numOfReviews,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});
reviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = new mongoose.model("Review", reviewSchema);
