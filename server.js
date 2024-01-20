const express = require("express");
const app = express();
const db = require("./config/database");
const bodyParser = require("body-parser");
const port = process.env.PORT;
const {config} = require("./config/eenvironment");
const apiRouter = require("./api");
const cors = require("cors")

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())


app.use(apiRouter);



app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
