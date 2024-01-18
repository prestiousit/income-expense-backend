const express = require("express");
const {LabelCreate } = require("../controllers/label");
const router  = express();

router.post('/create',LabelCreate)

module.exports = router;