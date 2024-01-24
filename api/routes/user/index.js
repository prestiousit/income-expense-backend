const express = require("express");
const router = express.Router();
const { UserCreate, UserGet } = require("../../controllers/user");
const {AdminAuth} = require("../../../middleware/adminauth")

// router.use(AdminAuth)
router.post("/create", UserCreate);
router.get("/get", UserGet);
// router.delete("/delete", );
// router.patch("/update", );


module.exports = router;
