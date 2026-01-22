const Movement = require("../model/movement.model");
const User = require("../model/user.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { generateToken, verifyToken } = require("../utils/jwtHelper");

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword, amount } = req.body;

  // 1. Validate input
  if (!name || !email || !password || !confirmPassword) {
    return next(new AppError("All fields are required", 400));
  }

  // 2. Check existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already exists", 409));
  }

  // 3. Create user
  const newUser = await User.create({
    name,
    email,
    password,
    confirmPassword,
  });

  // convert amoun from req.body.amount to Number
  const movementAmount = amount ? Number(amount) : 0;

  // movements
  await Movement.create({
    amount: movementAmount,
    user: newUser._id,
  });

  // 4. Generate token
  let token = generateToken(newUser._id);
  if (!token) {
    return next(new AppError("failed to generate token", 400));
  }

  // 5. Set cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  // 6. Remove sensitive fields
  newUser.password = undefined;

  res.status(201).json({
    status: "success",
    message: "User signed up successfully",
    data: {
      token,
      user: newUser,
    },
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new apperror("icorrect email or password", 404));
  }

  let token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  user.password = undefined;

  res.status(201).json({
    status: "success",
    message: "User signed In successfully",
    data: {
      token,
      user,
    },
  });
});

exports.me = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate({
    path: "movement",
    select: "amount date -user",
  });
  if (!user) {
    return next(new AppError("user doesn't have amount", 404));
  }
  res.status(200).json({
    status: "success",
    message: "user data fetch successfully",
    data: {
      user,
    },
  });
});
