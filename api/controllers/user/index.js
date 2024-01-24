const moment = require("moment");
const db = require("../../../config/database");

const UserCreate = async (req, res) => {
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

    const Query = `INSERT INTO user (${field}) VALUES (${value})`;

    const [data] = await db.promise().query(Query);

    console.log(Query);
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
const UserGet = async (req, res) => {
  try {
    const Query = 'select id,name from user'
    const [user] = await db.promise().query(Query);

    const data = await user.map((el)=>{
      return {
        value : el.id,
        label : el.name
      }
    })
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
  UserCreate,
  UserGet
};
