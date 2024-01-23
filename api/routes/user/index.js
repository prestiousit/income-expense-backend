const express = require("express");
const router = express.Router();
const { UserCreate, UserGet} = require("../../controllers/user")

router.post("/create",UserCreate);
router.get("/get", UserGet);
// router.delete("/delete", );
// router.patch("/update", );

module.exports = router;