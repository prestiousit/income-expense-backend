const express = require("express");
const {TransactionCreate,TransactionUpdate, TransactionGet, TransactionDelete } = require("../../controllers/transaction");
const { AdminAuth } = require("../../../middleware/adminauth");
const router  = express();


router.use(AdminAuth)
router.post('/create',TransactionCreate)
router.get('/get',TransactionGet)
router.patch('/update',TransactionUpdate)
router.delete('/delete/:id',TransactionDelete)

module.exports = router;
