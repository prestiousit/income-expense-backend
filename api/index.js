const express = require("express");
const db = require("../config/database");

const apiRouter = express.Router();

apiRouter.use("/userAdmin", require("./routes/userAdmin"));

module.exports = apiRouter;
