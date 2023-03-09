const express = require("express");
const router = express.Router();
const {
  authenticateUserMiddleware,
  authorizePermissions,
} = require("../middleware/authentication");
const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require("../controllers/productController");

const { getSingleProductReviews } = require("../controllers/reviewController");

router
  .route("/")
  .get(getAllProducts)
  .post(
    authenticateUserMiddleware,
    authorizePermissions("admin"),
    createProduct
  );

router
  .route("/uploadImage")
  .post(authenticateUserMiddleware, authorizePermissions("admin"), uploadImage);

router
  .route("/:id")
  .get(getSingleProduct)
  .patch(
    authenticateUserMiddleware,
    authorizePermissions("admin"),
    updateProduct
  )
  .delete(
    authenticateUserMiddleware,
    authorizePermissions("admin"),
    deleteProduct
  );

router.route("/:id/reviews").get(getSingleProductReviews);
module.exports = router;
