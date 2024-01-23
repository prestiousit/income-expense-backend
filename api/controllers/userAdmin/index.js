const db = require("../../../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const AdminUserRegister = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new Error("Username or Password is Required");
    } 
    req.body.password = await bcrypt.hash(password, 10);
    const [user] = await db
      .promise()
      .query("INSERT INTO adminUser (username,password) VALUES (?,?)", [
        username,
        req.body.password,
      ]);
    res.status(201).json({
      status: "success",
      message: "user created successfully",
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

const AdminUserLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [user] = await db
      .promise()
      .query("SELECT * FROM adminUser WHERE username = ?", [username]);

    if (!user || user.length === 0) {
      throw new Error("Incorrect username or password");
    }

    const checkpaasword = await bcrypt.compare(
      password,
      user[0].password
    );
    if (!checkpaasword) {
      throw new Error("Incorrect username or 'password'");
    }

    const token = jwt.sign({ id: user[0].id,username : user[0].username }, "SURAT");


    res.status(200).json({
      status: "success",
      message: "Login successfully",
      user: user[0],
      token
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

const AdminUserDelete = async (req, res) => {
  try {
    const userId = req.query.id;

    const [user] = await db
      .promise()
      .query("SELECT * FROM adminUser WHERE id = ?", [userId]);

    if (!user || user.length === 0) {
      throw new Error("user not found");
    }

    const [deleteuser] = await db
      .promise()
      .query("DELETE FROM adminUser WHERE id = ?", [userId]);

    res.status(200).json({
      status: "success",
      message: "deleted successfully",
      user: deleteuser,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

const AdminUserUpdate = async (req, res) => {
  try {
    const userId = req.query.id;
    const [user] = await db
      .promise()
      .query("SELECT * FROM adminUser WHERE id = ?", [userId]);

    if (!user || user.length === 0) {
      throw new Error("user not found");
    }
    let { username, password } = req.body;

    username = username ?? user[0].username;
    password = password ?? user[0].password;

    const [updateuser] = await db
      .promise()
      .query(
        "UPDATE adminUser SET username = ? , password = ? WHERE id = ?",
        [username, password, userId]
      );

    res.status(200).json({
      status: "success",
      message: "updated successfully",
      user: updateuser,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = {
  AdminUserRegister,
  AdminUserLogin,
  AdminUserDelete,
  AdminUserUpdate
};