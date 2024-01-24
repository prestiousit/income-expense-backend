const moment = require("moment");
const db = require("../../../config/database");
const { QueryableBase } = require("mysql2/typings/mysql/lib/protocol/sequences/QueryableBase");

const userCreate = async (req, res) => {
  try {
    const { name, description, mobileNo, status } = req.body;

    if (!name) throw new Error("Name is Required..!");
    if (!status) req.body.status = "active";

    //  req.body.createdBy = "" //pass admin id using auth
    req.body.isDeleted = 0;
    req.body.createdAt = moment().format("YYYY-MM-DD hh:mm:ss");

    const field = Object.keys(req.body)
      .map((key) => key)
      .toString();
    const value = Object.keys(req.body)
      .map((key) => `'${req.body[key]}'`)
      .toString();

    const query = `INSERT INTO user (${field}) VALUES (${value})`;

    const [data] = await db.promise().query(query);
    res.status(200).json({
      status: "success",
      message: "user Created successfully",
      data,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};
const userGet = async (req, res) => {
  try {
    const query = "select id,name from user";
    const [user] = await db.promise().query(QueryableBaseuery);

    const data = await user.map((el) => {
      return {
        value: el.id,
        label: el.name,
      };
    });
    res.status(200).json({
      status: "success",
      message: "user find successfully",
      data,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = {
  userCreate,
  userGet,

};

