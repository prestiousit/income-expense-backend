const moment = require("moment");
const db = require("../../../config/database");

const transactionCreate = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!paymentStatus) req.body.paymentStatus = "active";

    //  req.body.createdBy = "" //pass admin id using auth
    req.body.isDeleted = 0;
    req.body.createdAt = moment().format("YYYY-MM-DD hh:mm:ss");

    const field = Object.keys(req.body)
      .map((key) => key)
      .toString();
    const value = Object.keys(req.body)
      .map((key) => `'${req.body[key]}'`)
      .toString();

    const query = `INSERT INTO transaction (${field}) VALUES (${value})`;

    const [data] = await db.promise().query(query);
    res.status(201).json({
      status: "sucess",
      message: "transaction Inserted successfully",
      data,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const transactionUpdate = async (req, res) => {
  try {
    const transactionId = req.query.id;
    const [transaction] = await db
      .promise()
      .query("SELECT * FROM transaction WHERE id = ?", [transactionId]);

    if (!transaction || transaction.length === 0) {
      throw new Error("transaction not found");
    }

    req.body.updatedAt = moment().format("YYYY-MM-DD hh:mm:ss");

    const updateFields = Object.keys(req.body)
      .map((key) => `${key} = '${req.body[key]}'`)
      .join(", ");

    const query = `UPDATE transaction SET ${updatedFields} , updatedAt=CURDATE() WHERE id = ${transactionId}`;
    const [updatedTransaction] = await db.promise().query(query);

    res.status(200).json({
      status: "success",
      message: "transaction updated successfully",
      data: updatedTransaction,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const transactionGet = async (req, res) => {
  try {
    const query = `SELECT t.id, t.date, t.type, t.amount, t.description, u.name as paidBy, b.bankNickName, t.paymentStatus, l.name as transactionLabel, t.color 
    FROM transaction t
    LEFT JOIN user u ON t.paidBy = u.id
    LEFT JOIN label_category l ON t.transactionLabel = l.id
    LEFT JOIN bank b ON t.bank = b.id
    WHERE t.isDeleted = 0`;
    const [transaction] = await db.promise().query(query);
    if (!transaction || transaction.length === 0) {
      throw new Error("no data found");
    }

    res.status(200).json({
      status: "success",
      message: "get all data of bank",
      transaction: transaction,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const transactionDelete = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const [transaction] = await db
      .promise()
      .query("SELECT * FROM transaction WHERE id = ?", [transactionId]);

    if (!transaction || transaction.length === 0) {
      throw new Error("transaction not found");
    }

    const [deletetransaction] = await db
      .promise()
      .query(
        "UPDATE transaction SET isDeleted = 1, deletedAt=curdate() WHERE id = ?",
        [transactionId]
      );

    res.status(200).json({
      status: "success",
      message: "transaction Deleted successfully",
      transaction: deletetransaction,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

module.exports = {
  transactionCreate,
  transactionUpdate,
  transactionGet,
  transactionDelete,
};
