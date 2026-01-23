const path = require("path");
const fs = require("fs");
const User = require("../model/user.model");
const Movement = require("../model/movement.model");
const catchAsync = require("../utils/catchAsync"); // Assuming this is your wrapper path

// Helper to clean the database
const cleanDB = async () => {
  await User.deleteMany();
  await Movement.deleteMany();
};

exports.importData = catchAsync(async (req, res, next) => {
  // 1. Simplified Path Construction
  const filePath = path.join(__dirname, "../../data/fake-data.json");
  const payload = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const { users = [], movements = [] } = payload;

  // 2. Clear existing data first
  await cleanDB();

  // 3. Create Users (Sequential for middleware/hashing)
  const createdUsers = [];
  for (const u of users) {
    const userData = { ...u, confirmPassword: u.password };
    const created = await User.create(userData);
    createdUsers.push(created);
  }

  // 4. Map IDs and Insert Movements
  const origToCreated = {};
  users.forEach((origUser, index) => {
    origToCreated[origUser._id] = createdUsers[index]._id;
  });

  const movementsToInsert = movements.map((m) => ({
    ...m,
    user: origToCreated[m.user] || m.user,
  }));

  await Movement.insertMany(movementsToInsert);

  res.status(201).json({
    status: "success",
    message: "Database wiped and re-populated",
    createdUsers: createdUsers.length,
    createdMovements: movementsToInsert.length,
  });
});

// 5. Separate Handler for Deleting All Data
exports.deleteAllData = catchAsync(async (req, res, next) => {
  await cleanDB();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
