const express = require("express");
const router = express.Router();
const {
    authenticateUserMiddleware,
    authorizePermissions,
} = require("../middleware/authentication");

const {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
} = require("../controllers/reviewController");

router
    .route("/")
    .post(authenticateUserMiddleware, createReview)
    .get(getAllReviews);

router
    .route("/:id")
    .get(getSingleReview)
    .patch(authenticateUserMiddleware, updateReview)
    .delete(authenticateUserMiddleware, deleteReview);

module.exports = router;