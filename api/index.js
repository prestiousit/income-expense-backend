const express = require("express");
const db = require("../config/database");

const apiRouter = express.Router();

apiRouter.use("/userAdmin", require("./routes/userAdmin"));
apiRouter.use("/bank", require("./routes/bank"));
apiRouter.use("/user", require("./routes/user"));
apiRouter.use("/transction", require("./routes/transction"));
module.exports = apiRouter;
