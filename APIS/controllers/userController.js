const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const customError = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils");
const { pick } = require("../utils");

const getAllUsers = async (req, res, next) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).select("-password");

  if (!user) {
    throw new customError.NotFoundError(`No user found with given id : ${id}`);
  }
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res, next) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

// UPDATE USER : USING findOneAndUpdate
// const updateUser = async (req, res, next) => {
//   const { name, email } = req.body;

//   // here user can only update fields [name and email] , user can't upgrade itself to be admin[not allowed]

//   if (!name && !email)
//     throw new customError.BadRequestError(
//       "Please provide updated or/and name and email!!!"
//     );

//   const updateFileds = pick(req.body, "name", "email");
//   const updatedUser = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     updateFileds,
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   const tokenUser = createTokenUser({ user: updatedUser });

//   attachCookiesToResponse({ res, user: tokenUser });

//   res.status(StatusCodes.OK).json({ updatedUser: tokenUser });
// };

// UPDATE USER : USING .save()
const updateUser = async (req, res, next) => {
  const { name, email } = req.body;

  // here user can only update fields [name and email] , user can't upgrade itself to be admin[not allowed]

  if (!name || !email)
    throw new customError.BadRequestError("Please provide name and email!!!");

  const user = await User.findOne({ _id: req.user.userId });
  user.name = name;
  user.email = email;
  console.log(user);
  user.save(); // pre-hook in models will be invoked , take care of that please :)
  const tokenUser = createTokenUser({ user });
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ msg: "User Info updated Successfully" });
};

const updateUserPassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findOne({ _id: req.user.userId });

  if (!oldPassword || !newPassword)
    throw new customError.NotFoundError("Please provide old and new passwords");

  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch)
    throw new customError.UnauthenticatedError("Password doesn't match!!!");

  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Password updated successfully!!!" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
