const express = require("express");
const router = express.Router();

const {
  authenticateUserMiddleware,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  createOrder,
  getAllOrders,

  getCurrentUserOrders,

  getSingleOrder,
  UpdateOrder,
} = require("../controllers/orderController");

router
  .route("/")
  .post(authenticateUserMiddleware, createOrder)
  .get(authenticateUserMiddleware, authorizePermissions("admin"), getAllOrders);

router
  .route("/showAllMyOrders")
  .get(authenticateUserMiddleware, getCurrentUserOrders);

router
  .route("/:id")
  .get(authenticateUserMiddleware, getSingleOrder)
  .patch(authenticateUserMiddleware, UpdateOrder);

module.exports = router;
