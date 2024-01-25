const express = require("express");
const {
  labelGet, labelCreate
} = require("../../controllers/label");
const router = express();

router.get("/get", labelGet);
router.post("/create", labelCreate);

module.exports = router;