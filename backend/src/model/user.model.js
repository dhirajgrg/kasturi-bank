const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      // validate: [validator.isEmail, "invalid Email"],
      // unique: true,
    },
    password: {
      type: String,
      required: true,
      default: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "please confirm password"],
      validate: function (el) {
        return el === this.password;
      },
      message: "password are not same",
    },
    interestRate: {
      type: Number,
      default: 1.2,
    },
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// virtual movement
userSchema.virtual("movement", {
  ref: "Movement",
  foreignField: "user",
  localField: "_id",
});

// hash password and save it
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  // hash password
  this.password = await bcrypt.hash(this.password, 12);
  // make password undefined
  this.confirmPassword = undefined;
});

// TIMESTAMP MIDDLEWARE (Run this only when updating existing password)
userSchema.pre("save", function () {
  if (!this.isModified("password") || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;
});

// timestamps for password
userSchema.methods.passwordChangedAfter = function (JWTiat) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTiat < changedTimeStamp;
  }
  return false;
};

// compare password method
userSchema.methods.comparePassword = async function (
  currentPassword,
  userPassword,
) {
  return await bcrypt.compare(currentPassword, userPassword);
};

module.exports = mongoose.model("User", userSchema);
