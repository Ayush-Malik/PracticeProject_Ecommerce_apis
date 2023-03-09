const { StatusCodes } = require("http-status-codes");
const Product = require("../models/Product");
const Review = require("../models/Review");
const customError = require("../errors");
const { checkPermissions } = require("../utils/checkPermissions");

const createReview = async (req, res, next) => {
  const { product: productId } = req.body;

  // checking if any product exists with given productId
  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct)
    throw new customError.NotFoundError(
      `No product exist with id = ${productId}`
    );

  // checking if user have already submitted review for current product[manuallu (alteranate way is implemented in mongoose model file)]
  const alreadySubmittedReview = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (alreadySubmittedReview)
    throw new customError.BadRequestError(
      "Review for this product is already submitted by you!!!"
    );

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.OK).json({ review });
};

const getAllReviews = async (req, res, next) => {
  const reviews = await Review.find()
    .populate({
      path: "product",
      select: "name company",
    })
    .populate({
      path: "user",
      select: "name",
    });

  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

const getSingleReview = async (req, res, next) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review)
    throw new customError.NotFoundError(
      `No review found with id = ${reviewId}`
    );
  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res, next) => {
  const { id: reviewId } = req.params;

  const { rating, title, comment } = req.body;

  const review = await Review.findOne({ _id: reviewId });

  if (!review)
    throw new customError.NotFoundError(
      `No review found with id = ${reviewId}`
    );

  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();

  res.status(StatusCodes.OK).json({ msg: "Review updated successfully!!!" });
};

const deleteReview = async (req, res, next) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });

  if (!review)
    throw new customError.NotFoundError(
      `No review found with id = ${reviewId}`
    );

  checkPermissions(req.user, review.user);

  await review.remove();

  res.status(StatusCodes.OK).json({ msg: "Review deleted successfully!!!" });
};

const getSingleProductReviews = async (req, res, next) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
