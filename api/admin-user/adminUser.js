const express = require("express");
const { AdminUserLogin, AdminUserRegister, AdminUserDelete, AdminUserUpdate } = require("../controllers/adminUser");
const router = express.Router();

router.post("/register", AdminUserRegister);
router.post("/login", AdminUserLogin);
router.delete("/delete", AdminUserDelete);
router.patch("/update", AdminUserUpdate);

module.exports = router;
