const express = require("express");
const {bankCreate, bankUpdate, bankDelete, bankGet } = require("../../controllers/bank");
const { AdminAuth } = require("../../../middleware/adminauth");
const router  = express();

// router.use(AdminAuth)
router.post('/create',bankCreate);
router.get('/get',bankGet)
router.patch('/update',bankUpdate)
router.delete('/delete',bankDelete)

module.exports = router;
