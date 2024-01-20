const express = require("express");
const apiRouter = express.Router();

apiRouter.use("/userAdmin", require("./routes/admin-user/adminUser"));
apiRouter.use("/label", require("./routes/label/label"));
apiRouter.use("/user", require("./routes/user/user"));
apiRouter.use("/bank", require("./routes/bank/bank"));
apiRouter.use("/transaction", require("./routes/transaction/transaction"));

module.exports = apiRouter;
