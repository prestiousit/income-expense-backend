const express = require("express");
const {bankCreate, bankUpdate, bankDelete, bankGet, bankGetDropDown } = require("../../controllers/bank");
const { adminAuth } = require("../../../middleware/adminauth");
const router  = express();

router.use(adminAuth)
router.post('/create',bankCreate);
router.get('/get',bankGet)
router.patch('/update',bankUpdate)
router.delete('/delete',bankDelete)
router.get('/getdropdown',bankGetDropDown)

module.exports = router;
