const express = require("express");
const { adminUserLogin, adminUserRegister, adminUserDelete, adminUserUpdate } = require("../../controllers/userAdmin");
const { adminAuth } = require("../../../middleware/adminauth");
const router = express.Router();

router.post("/login", adminUserLogin);

router.use(adminAuth)
router.post("/register", adminUserRegister);
router.delete("/delete", adminUserDelete);
router.patch("/update", adminUserUpdate);

module.exports = router;