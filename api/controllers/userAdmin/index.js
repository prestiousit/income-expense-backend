const db = require("../../../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { adminUserTabel } = require("../../../database/tabelName");

const adminUserRegister = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new Error("Username or Password is Required");
    }
    req.body.password = await bcrypt.hash(password, 10);
    const query = `INSERT INTO ${adminUserTabel} (username,password,status) VALUES ("${username}",'${req.body.password}','active')`;
    const [user] = await db.promise().query(query);
    res.status(201).json({
      status: "success",
      message: "user created successfully",
      data : user
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

const adminUserLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const query = `SELECT * FROM ${adminUserTabel} WHERE username = "${username}"`;
    const [user] = await db.promise().query(query);

    if (!user || user.length === 0) {
      throw new Error("Incorrect username or password");
    }

    const checkpaasword = await bcrypt.compare(password, user[0].password);
    if (!checkpaasword) {
      throw new Error("Incorrect username or 'password'");
    }

    const token = jwt.sign(
      { id: user[0].id, username: user[0].username },
      process.env.SECRET_KEY
    );

    res.status(200).json({
      status: "success",
      message: "Login successfully",
      user: user[0],
      token,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

const adminUserDelete = async (req, res) => {
  try {
    const userId = req.query.id;
    const query = `SELECT * FROM ${adminUserTabel} WHERE id = ${userId}`;
    const [user] = await db.promise().query(query);

    if (!user || user.length === 0) {
      throw new Error("user not found");
    }

    const deleteQuery = `DELETE FROM ${adminUserTabel} WHERE id = ${userId}`;
    const [deleteuser] = await db.promise().query(deleteQuery);

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

const adminUserUpdate = async (req, res) => {
  try {
    const userId = req.query.id;
    const query = `SELECT * FROM ${adminUserTabel} WHERE id = ${userId}`;
    const [user] = await db.promise().query(query);

    if (!user || user.length === 0) {
      throw new Error("user not found");
    }
    let { username, password } = req.body;

    username = username ?? user[0].username;
    password = password ?? user[0].password;

    const updateQuery = `UPDATE ${adminUserTabel} SET username = ${username} , password = ${password} WHERE id = ${userId}`;

    const [updateuser] = await db.promise().query(updateQuery);

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
  adminUserRegister,
  adminUserLogin,
  adminUserDelete,
  adminUserUpdate,
};
