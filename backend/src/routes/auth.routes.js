const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/signup", authController.signUp);
router.post("/login", authController.logIn);
router.get("/logout", authController.logout);
router.get("/me", authMiddleware.protect, authController.me);

router.post("/transfer", authMiddleware.protect, authController.transfer);
router.post("/loan", authMiddleware.protect, authController.requestLoan);
router.delete("/close", authMiddleware.protect, authController.closeAccount);

module.exports = router;
