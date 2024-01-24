const moment = require("moment");
const db = require("../../../config/database");

const TransactionCreate = async (req, res) => {
  try {
    let { date, type, amount, bank, paymentStatus } = req.body;
    if (!date || !type || !amount || !bank || !paymentStatus) {
      throw new Error("Fields are required.");
    }
    req.body.isDeleted = 0;
    req.body.createdAt = moment().format("YYYY-MM-DD hh:mm:ss");
    const field = Object.keys(req.body)
      .map((key) => key)
      .toString();
    const value = Object.keys(req.body)
      .map((key) => `'${req.body[key]}'`)
      .toString();

    const Query = `INSERT INTO transaction (${field}) VALUES (${value})`;
    const [transaction] = await db.promise().query(Query);

    res.status(201).json({
      status: "sucess",
      message: "transaction Inserted successfully",
      transaction: transaction,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const TransactionUpdate = async (req, res) => {
  try {
    const transactionId = req.query.id;
    const [transaction] = await db
      .promise()
      .query("SELECT * FROM transaction WHERE id = ?", [transactionId]);

    if (!transaction || transaction.length === 0) {
      throw new Error("transaction not found");
    }
    const updatedFields = [
      "date",
      "type",
      "amount",
      "description",
      "paidBy",
      "bank",
      "paymentStatus",
      "transactionLabel",
      "color",
    ].reduce(
      (obj, key) => ({ ...obj, [key]: req.body[key] ?? transaction[0][key] }),
      {}
    );

    const [updatedTransaction] = await db
      .promise()
      .query("UPDATE transaction SET ? , updatedAt=CURDATE() WHERE id = ?", [
        updatedFields,
        transactionId,
      ]);

    res.status(200).json({
      status: "success",
      message: "transaction updated successfully",
      transaction: updatetransaction,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const TransactionGet = async (req, res) => {
  try {
    const [transaction] = await db
      .promise()
      .query(
        "SELECT id,date,type,amount,description,paidBy,bank,paymentStatus,transactionLabel,color FROM transaction WHERE isDeleted = 0"
      );

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

const TransactionDelete = async (req, res) => {
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
  TransactionCreate,
  TransactionUpdate,
  TransactionGet,
  TransactionDelete,
};
