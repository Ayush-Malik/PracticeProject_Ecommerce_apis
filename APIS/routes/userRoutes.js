const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");
const {
  authorizePermissions,
  authenticateUserMiddleware,
} = require("../middleware/authentication");

router
  .route("/")
  .get(authenticateUserMiddleware, authorizePermissions("admin"), getAllUsers);

router.route("/showMe").get(authenticateUserMiddleware, showCurrentUser); // this route must be before "/:id" this route

router.route("/updateUser").patch(authenticateUserMiddleware, updateUser);

router
  .route("/updateUserPassword")
  .patch(authenticateUserMiddleware, updateUserPassword);

router
  .route("/:id")
  .get(
    authenticateUserMiddleware,
    authorizePermissions("admin"),
    getSingleUser
  );

module.exports = router;
