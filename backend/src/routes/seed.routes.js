const express = require("express");
const router = express.Router();
const { importData,deleteAllData } = require("../controller/seed.controller");

router.post("/import", importData);
router.post("/import", deleteAllData);

module.exports = router;
