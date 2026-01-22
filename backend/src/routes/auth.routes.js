const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/signup", authController.signUp);
router.post("/login", authController.logIn);

router.get("/me", authMiddleware.protect, authController.me);

module.exports = router;
