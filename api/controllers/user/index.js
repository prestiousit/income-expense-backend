const moment = require("moment");
const db = require("../../../config/database");
const { userTabel } = require("../../../database/tabelName");
const { jwtTokenVerify } = require("../../../helper/methods");

const userCreate = async (req, res) => {
  try {

    const tokenData = await jwtTokenVerify(req.headers.token);

    const { name, description, mobileNo, status } = req.body;

    if (!name) throw new Error("Name is Required..!");
    if (!status) req.body.status = "active";

     req.body.createdBy = tokenData.id 
    req.body.isDeleted = 0;
    req.body.createdAt = new Date();

    const field = Object.keys(req.body)
      .map((key) => key)
      .toString();
    const value = Object.keys(req.body)
      .map((key) => `'${req.body[key]}'`)
      .toString();

    const query = `INSERT INTO ${userTabel} (${field}) VALUES (${value})`;

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
    const query = `select id,name from ${userTabel}`;
    const [user] = await db.promise().query(query);

    const data = await user.map((el) => {
      return {
        value : el.id,
        label : el.name
      }
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
