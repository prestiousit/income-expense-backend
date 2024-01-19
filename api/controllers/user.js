const db = require("../../config/database");

const UserCreate = async (req, res) => {
  try {
    let { name, mobileno, status } = req.body;

    if(!name){
      throw new Error("Name is Required");
    }else if(!mobileno){
      throw new Error("Mobileno is Required");
    }else if(!status){
      status = "active"
    }

    const [user] = await db
      .promise()
      .query(
        "INSERT INTO user (name,mobileno,status) VALUES (?,?,?)",
        [name, mobileno,status]
      );

    res.status(201).json({
      status: "success",
      message: "user created successfully",
      user: user,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const UserUpdate = async (req, res) => {
  try {
    const userId = req.query.id;
    const [user] = await db
      .promise()
      .query("SELECT * FROM user WHERE id = ?", [userId]);

    if (!user || user.length === 0) {
      throw new Error("user not found");
    }
    let { name, mobileno,status } = req.body;

    name = name ?? user[0].name;
    mobileno = mobileno ?? user[0].mobileno;
    status = status ?? user[0].status;

    const [updateuser] = await db
      .promise()
      .query(
        "UPDATE user SET name = ? , mobileno = ?, status = ?  WHERE id = ?",
        [name, mobileno, status , userId]
      );

    res.status(200).json({
      status: "success",
      message: "updated successfully",
      user: updateuser,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const UserGet = async (req, res) => {
  try {
    const [user] = await db.promise().query("SELECT * FROM user WHERE isDeleted = 0 AND status = 'active'");

    if (!user || user.length === 0) {
      throw new Error("no data found");
    }

    res.status(200).json({
      status: "success",
      message: "get all data",
      user: user,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const UserDelete = async (req, res) => {
  try {
    const userId = req.query.id;
    const [user] = await db
      .promise()
      .query("SELECT * FROM user WHERE id = ?", [userId]);

    if (!user || user.length === 0) {
      throw new Error("user not found");
    }

    const [deleteuser] = await db
      .promise()
      .query(
        "UPDATE user SET isDeleted = 1 WHERE id = ?",
        [userId]
      );

    res.status(200).json({
      status: "success",
      message: "Deleted successfully",
      label: deleteuser,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

module.exports = {
  UserCreate,
  UserUpdate,
  UserGet,
  UserDelete
};