const db = require("../../config/database");

const AdminUserRegister = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      throw new Error("Username is Required");
    } else if (!password) {
      throw new Error("Password is Required");
    }

    const [user] = await db
      .promise()
      .query("INSERT INTO admin_user (username,password) VALUES (?,?)", [
        username,
        password,
      ]);

    res.status(201).json({
      status: "ok",
      message: "user created successfully",
      user: user,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

const AdminUserLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [user] = await db
      .promise()
      .query("SELECT * FROM admin_user WHERE username = ?", [username]);

    if (!user || user.length === 0) {
      throw new Error("Incorrect username or password");
    }

    if (user[0].password !== password) {
      throw new Error("Incorrect username or 'password'");
    }

    res.status(200).json({
      status: "ok",
      message: "Login successfully",
      user: user[0],
    });
  } catch (error) {
    res.status(404).json({
      status: "not",
      message: error.message,
    });
  }
};

const AdminUserDelete = async (req, res) => {
  try {
    const userId = req.query.id;

    const [user] = await db
      .promise()
      .query("SELECT * FROM admin_user WHERE id = ?", [userId]);

    if (!user || user.length === 0) {
      throw new Error("user not found");
    }

    const [deleteuser] = await db
      .promise()
      .query("DELETE FROM admin_user WHERE id = ?", [userId]);

    res.status(200).json({
      status: "ok",
      message: "deleted successfully",
      user: deleteuser,
    });
  } catch (error) {
    res.status(404).json({
      status: "not",
      message: error.message,
    });
  }
};

const AdminUserUpdate = async (req, res) => {
  try {
    const userId = req.query.id;
    const [user] = await db
      .promise()
      .query("SELECT * FROM admin_user WHERE id = ?", [userId]);

    if (!user || user.length === 0) {
      throw new Error("user not found");
    }
    let { username, password } = req.body;

    username = username ?? user[0].username;
    password = password ?? user[0].password;

    const [updateuser] = await db
      .promise()
      .query(
        "UPDATE admin_user SET username = ? , password = ? WHERE id = ?",
        [username, password, userId]
      );

    res.status(200).json({
      status: "ok",
      message: "updated successfully",
      user: updateuser,
    });
  } catch (error) {
    res.status(404).json({
      status: "not",
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
