const express = require("express");
const {
  UserCreate,
  UserUpdate,
  UserGet,
  UserDelete,
  UserAddByFrontEnd,
} = require("../../controllers/user");
const router = express();

router.post("/create", UserCreate);
router.get("/get", UserGet);
router.patch("/update", UserUpdate);
router.delete("/delete", UserDelete);
router.get("/userid", UserAddByFrontEnd);

module.exports = router;
