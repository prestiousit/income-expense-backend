const db = require("../../../config/database");
const { labelcategoryTabel } = require("../../../database/tabelName");
const { jwtTokenVerify } = require("../../../helper/methods");


const labelGet = async (req, res) => {
  try {
    const filed = ["id", "name"];

    const sql = `SELECT ${filed.toString()} FROM ${labelcategoryTabel} WHERE isDeleted = 0`;

    const [label] = await db.promise().query(sql);


    const data = await label.map((value) => {
      return {
        value: value.id,
        label: value.name,
      };
    });
    res.status(200).json({
      status: "success",
      message: "get all data of label",
      data,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const labelCreate = async (req, res) => {
  try {
    const tokenData = await jwtTokenVerify(req.headers.token);

    if (!req.body.color) {
      req.body.color = "#ffffff";
    }

    req.body.createdBy = tokenData.id;
    req.body.createdAt = `${new Date()}`;
    const field = Object.keys(req.body)
      .map((key) => key)
      .toString();
    const value = Object.keys(req.body)
      .map((key) => `'${req.body[key]}'`)
      .toString();

    const sql = `INSERT INTO ${labelcategoryTabel} (${field}) VALUES (${value})`;

    const [data] = await db.promise().query(sql);

    res.status(200).json({
      status: "success",
      message: "inserted label",
      data,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

module.exports = {
  labelGet,
  labelCreate,
};
