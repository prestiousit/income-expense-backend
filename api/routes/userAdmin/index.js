const express = require("express");
const { AdminUserLogin, AdminUserRegister, AdminUserDelete, AdminUserUpdate } = require("../../controllers/userAdmin");
const { AdminAuth } = require("../../../middleware/adminauth");
const router = express.Router();

router.post("/login", AdminUserLogin);

router.use(AdminAuth)
router.post("/register", AdminUserRegister);
router.delete("/delete", AdminUserDelete);
router.patch("/update", AdminUserUpdate);

module.exports = router;