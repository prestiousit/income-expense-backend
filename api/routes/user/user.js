const express = require("express");
const {UserCreate,UserUpdate, UserGet, UserDelete } = require("../../controllers/user");
const router  = express();

router.post('/create',UserCreate)
router.get('/get',UserGet)
router.patch('/update',UserUpdate)
router.delete('/delete',UserDelete)

module.exports = router;