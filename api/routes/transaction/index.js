const express = require("express");
const {TransactionCreate,TransactionUpdate, TransactionGet, TransactionDelete } = require("../../controllers/transaction");
const router  = express();

router.post('/create',TransactionCreate)
router.get('/get',TransactionGet)
router.patch('/update',TransactionUpdate)
router.delete('/delete/:id',TransactionDelete)

module.exports = router;
