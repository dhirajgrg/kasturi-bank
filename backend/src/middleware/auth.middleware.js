const { generateToken, verifyToken } = require("../utils/jwtHelper");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const User = require("../model/user.model");

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Get token from cookies
  let token = req.cookies.token;

  // 2. Check if token exists
  if (!token) {
    return next(
      new AppError("You are not logged in. Please log in to get access.", 401),
    );
  }

  // 3. Verify token
  // verifyToken returns the payload { id, iat, exp }
  const decoded = verifyToken(token); 

  if (!decoded) {
    return next(new AppError("Invalid token or token expired.", 401));
  }

  // 4. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401),
    );
  }

  //   5.check if user changed password after token issued or not
  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError("user recently changed password please login again!", 401),
    );
  }

  // 6. GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = function (...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Access denied", 403));
    }
    return next();
  };
};
