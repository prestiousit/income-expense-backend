const express = require('express');
const apiRouter = express.Router();

apiRouter.use('/user',require('./admin-user/adminUser'));
apiRouter.use('/label',require('./label/label'));

module.exports = apiRouter;