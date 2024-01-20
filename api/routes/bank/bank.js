const express = require("express");
const {
  BankCreate,
  BankUpdate,
  BankDelete,
  BankGet,
  BankAddByFrontEnd,
} = require("../../controllers/bank");
const router = express();

router.post("/create", BankCreate);
router.get("/get", BankGet);
router.patch("/update", BankUpdate);
router.delete("/delete", BankDelete);
router.get("/bankid", BankAddByFrontEnd);

module.exports = router;
