const express = require("express");
const {BankCreate, BankUpdate, BankDelete, BankGet } = require("../../controllers/bank");
const { AdminAuth } = require("../../../middleware/adminauth");
const router  = express();

router.use(AdminAuth)
router.post('/create',BankCreate);
router.get('/get',BankGet)
router.patch('/update',BankUpdate)
router.delete('/delete',BankDelete)

module.exports = router;