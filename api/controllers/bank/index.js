const db = require("../../../config/database");
const {
  bankTabel,
  userTabel,
  labelcategoryTabel,
  transactionTabel,
} = require("../../../database/tabelName");
const { jwtTokenVerify } = require("../../../helper/methods");
const bankCreate = async (req, res) => {
  try {
    let {
      banknickname,
      amount,
      user,
      status,
      bankLabel,
    } = req.body;

    console.log("value====>", req.body);
    if (!user) {
      throw new Error("User is Required..!");
    } else if (!banknickname) {
      throw new Error("Bank Nick Name is Required..!");
    } else if (!amount) {
      throw new Error("Amount is Required..!");
    }

    if (!status) {
      status = "active";
    }

    req.body.isDeleted = 0;
    req.body.createdBy = "1";
    req.body.createdAt = new Date();

    const keys = Object.keys(req.body)
      .map((key) => `${key}`)
      .join(", ");

    const keyvalues = Object.keys(req.body)
      .map((key) => `'${req.body[key]}'`)
      .join(", ");

    const sql = `INSERT INTO ${bankTabel}
      (${keys})
       VALUES (${keyvalues})`;

    console.log("query===>", sql);
    const [bank] = await db.promise().query(sql);
    if (!bankLabel) {
      bankLabel = "null";
    }

    const sql1 = `INSERT INTO ${transactionTabel} (bank , paidBy , amount ,transactionLabel,type) VALUES (${bank.insertId},${user},${amount},${bankLabel},"Income")`;
    console.log("sqlll===>", sql1);
    const [transaction] = await db.promise().query(sql1);

    res.status(201).json({
      status: "sucess",
      message: "bank Inserted successfully",
      data: bank,
      // transaction: transaction,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const bankUpdate = async (req, res) => {
  try {
    const bankId = req.query.id;
    const tokenData = await jwtTokenVerify(req.headers.token);

    req.body.updatedAt = new Date();
    req.body.updatedBy = tokenData.id;

    const updateFields = Object.keys(req.body)
      .map((key) => `${key} = '${req.body[key]}'`)
      .join(", ");

    const Quary = `UPDATE ${bankTabel} SET ${updateFields} WHERE id = ${bankId}`;

    const [updateuser] = await db.promise().query(Quary);

    res.status(200).json({
      status: "success",
      message: "bank updated successfully",
      user: updateuser,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const bankGet = async (req, res) => {
  try {
    const sql = `
      SELECT b.id,bankName,bankNickName,amount,user as userid ,bankLabel as labelid,bankBranch,accountNo,IFSC_code,b.mobileNo,u.name as username,b.description,l.name as bankLabel,b.status,b.color
      FROM ${bankTabel} b
      LEFT JOIN ${userTabel} u ON b.user = u.id
      LEFT JOIN ${labelcategoryTabel} l ON b.bankLabel = l.id
      WHERE b.isDeleted = 0`;

    const [Data] = await db.promise().query(sql);

    console.log(Data);
    res.status(200).json({
      status: "success",
      message: "get all data of bank",
      data: Data,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const bankDelete = async (req, res) => {
  try {
    const tokenData = await jwtTokenVerify(req.headers.token);
    const bankId = req.query.id;
    const query = `SELECT * FROM ${bankTabel} WHERE id = ${bankId}`;

    const [bank] = await db.promise().query(query);

    if (!bank || bank.length === 0) {
      throw new Error("bank not found");
    }

    const deleteQuery = `UPDATE ${bankTabel} SET isDeleted = 1, deletedAt = '${new Date()}', deletedBy = ${
      tokenData.id
    } WHERE id = ${bankId}`;
    const [deletebank] = await db.promise().query(deleteQuery);

    res.status(200).json({
      status: "success",
      message: "bank Deleted successfully",
      label: deletebank,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const bankGetDropDown = async (req, res) => {
  try {
    const filed = ["id", "bankNickName"];
    const sql = `SELECT ${filed.toString()} FROM ${bankTabel} WHERE isDeleted = 0 AND status = 'active'`;

    const [data] = await db.promise().query(sql);

    const Data = await data.map((value) => {
      return {
        value: value.id,
        label: value.bankNickName,
      };
    });

    res.status(200).json({
      status: "success",
      message: "get all data of bank",
      data: Data,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

module.exports = {
  bankCreate,
  bankUpdate,
  bankGet,
  bankDelete,
  bankGetDropDown,
};
