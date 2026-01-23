const Movement = require("../model/movement.model");
const User = require("../model/user.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { generateToken, verifyToken } = require("../utils/jwtHelper");

// cookie options helper
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

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
  res.cookie("token", token, cookieOptions);
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

  res.cookie("token", token, cookieOptions);

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

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    // include path/domain if you used them when setting the cookie
  });
  res.status(200).json({ status: "success", message: "Logged out" });
};

// Transfer money to another account
exports.transfer = catchAsync(async (req, res, next) => {
  const { toEmail, amount } = req.body;
  const amt = Number(amount);
  if (!toEmail || !amt || amt <= 0)
    return next(new AppError("Provide valid recipient and amount", 400));

  const senderId = req.user._id;
  const receiver = await User.findOne({ email: toEmail });
  if (!receiver) return next(new AppError("Recipient not found", 404));

  // compute sender balance
  const senderMovs = await Movement.find({ user: senderId });
  const balance = senderMovs.reduce((s, m) => s + m.amount, 0);
  if (balance < amt) return next(new AppError("Insufficient funds", 400));

  // create movements: debit sender, credit receiver
  await Movement.create([
    { amount: -amt, user: senderId },
    { amount: amt, user: receiver._id },
  ]);

  res.status(200).json({ status: "success", message: "Transfer completed" });
});

// Request a loan
exports.requestLoan = catchAsync(async (req, res, next) => {
  const { amount } = req.body;
  const amt = Number(amount);
  if (!amt || amt <= 0)
    return next(new AppError("Provide a valid loan amount", 400));

  const user = await User.findById(req.user._id).populate({
    path: "movement",
    select: "amount",
  });
  const deposits = user.movement
    .filter((m) => m.amount > 0)
    .map((m) => m.amount);

  // simple rule: grant loan if any deposit is at least 10% of requested loan
  const eligible = deposits.some((d) => d >= amt * 0.1);
  if (!eligible)
    return next(new AppError("Loan denied: insufficient deposit history", 400));

  await Movement.create({ amount: amt, user: user._id });

  res.status(201).json({ status: "success", message: "Loan approved" });
});

// Close account
exports.closeAccount = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(
      new AppError("Provide email and password to close account", 400),
    );

  const user = await User.findById(req.user._id).select("+password");
  if (
    !user ||
    user.email !== email ||
    !(await user.comparePassword(password, user.password))
  ) {
    return next(new AppError("Incorrect credentials", 401));
  }

  // delete movements and user
  await Movement.deleteMany({ user: user._id });
  await User.findByIdAndDelete(user._id);

  // clear cookie
  res.clearCookie("token", cookieOptions);

  res.status(204).json({ status: "success", message: "Account closed" });
});
