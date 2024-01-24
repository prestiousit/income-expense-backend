const express = require("express");
const {
  LabelGet, LabelCreate
} = require("../../controllers/label");
const router = express();

router.get("/get", LabelGet);
router.post("/create", LabelCreate);

module.exports = router;
