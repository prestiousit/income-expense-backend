const express = require("express");
const router = express.Router();
const { userCreate, userGet } = require("../../controllers/user");
const {adminAuth} = require("../../../middleware/adminauth")

router.use(adminAuth)
router.post("/create", userCreate);
router.get("/get", userGet);
// router.delete("/delete", );
// router.patch("/update", );


module.exports = router;
