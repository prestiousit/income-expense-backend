const express = require("express");
const {
  BankCreate,
  BankUpdate,
  BankDelete,
  BankGet,
  BankGetDropDown,
} = require("../../controllers/bank");
const router = express();

router.post("/create", BankCreate);
router.get("/get", BankGet);
router.patch("/update", BankUpdate);
router.delete("/delete", BankDelete);
router.get("/getdropdown", BankGetDropDown);

module.exports = router;
