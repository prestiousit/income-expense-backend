const express = require("express");
const {LabelCreate,LabelUpdate, LabelGet, LabelDelete, LabelAddByFrontEnd } = require("../../controllers/label");
const router  = express();

router.post('/create',LabelCreate)
router.get('/get',LabelGet)
router.patch('/update',LabelUpdate)
router.delete('/delete',LabelDelete)
router.get('/labelid',LabelAddByFrontEnd)

module.exports = router;