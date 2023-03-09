const customError = require("../errors");
const { isJWTvalid } = require("../utils");

const authenticateUserMiddleware = async (req, res, next) => {
  const { token } = req.signedCookies;

  if (!token)
    throw new customError.UnauthenticatedError("Token to dede bhai!!!");

  try {
    const { name, role, userId } = isJWTvalid({ token });
    req.user = { name, role, userId };
    next();
  } catch (error) {
    throw new customError.UnauthenticatedError("Token shi nhi hai bhai");
  }
};

/**
 *
 * @param  {...any} roles
 * @returns a callback based on roles given while invoking
 */
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      throw new customError.UnauthorizedError(
        "Unauthorized access to this route"
      );
    next();
  };
};

module.exports = {
  authenticateUserMiddleware,
  authorizePermissions,
};
