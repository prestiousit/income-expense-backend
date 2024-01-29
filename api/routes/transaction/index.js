const express = require("express");
const {transactionCreate,transactionUpdate, transactionGet, transactionDelete } = require("../../controllers/transaction");
const { adminAuth } = require("../../../middleware/adminauth");
const router  = express();


router.use(adminAuth)
router.post('/create',transactionCreate)
router.post('/get',transactionGet)
router.patch('/update',transactionUpdate)
router.delete('/delete/:id',transactionDelete)

module.exports = router;
