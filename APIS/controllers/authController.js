const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const customError = require("../errors");
const {
  createJWT,
  isJWTvalid,
  attachCookiesToResponse,
  createTokenUser,
} = require("../utils");

const { tokenUser } = require("../utils/");

const register = async (req, res, next) => {
  // first account will be an admin , all others will be users
  const isFirstAccount = (await User.countDocuments()) === 0;

  req.body.role = isFirstAccount ? "admin" : "user";

  const user = await User.create(req.body);

  const tokenUser = createTokenUser({ user });

  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ tokenUser });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new customError.BadRequestError("Incomplete Ceredentials!!!");

  const user = await User.findOne({ email });

  if (!user)
    throw new customError.UnauthenticatedError("Invalid Ceredentials!!!");

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect)
    throw new customError.BadRequestError("Incomplete Ceredentials!!!");

  const tokenUser = createTokenUser({ user });

  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ tokenUser });
};

const logout = async (req, res, next) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ "msg": "User logged out" });
};

module.exports = {
  register,
  login,
  logout,
};
