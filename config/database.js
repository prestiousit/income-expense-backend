const mysql = require("mysql2");
const {config} = require("./environment")

// establishing database connection
const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

db.connect(function (err) {
  if (err) {
    console.log(err.message);
  } else {
    console.log("MYSQL server connetd");
  }
});

module.exports = db;