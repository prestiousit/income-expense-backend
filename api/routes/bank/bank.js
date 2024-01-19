const express = require("express");
const {BankCreate, BankUpdate, BankDelete, BankGet } = require("../../controllers/bank");
const router  = express();

router.post('/create',BankCreate);
router.get('/get',BankGet)
router.patch('/update',BankUpdate)
router.delete('/delete',BankDelete)

module.exports = router;