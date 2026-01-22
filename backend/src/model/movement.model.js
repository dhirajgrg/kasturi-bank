const mongoose = require("mongoose");

const movementSchema = new mongoose.Schema({
  amount: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  // PARENT REFERENCE: Each movement knows who its owner is
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A movement must belong to a user"],
  },
});

// INDEXING: Makes searching for a user's movements significantly faster
movementSchema.index({ user: 1 });

module.exports = mongoose.model("Movement", movementSchema);
