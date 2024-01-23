const moment = require("moment");
const db = require("../../../config/database");

const TransactionCreate = async (req, res) => {
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

    const [data] = await db.promise().query(sql);

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

const TransactionUpdate = async (req, res) => {
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

    const query = `UPDATE transaction SET ${updateFields} WHERE id = ${transactionId}`;

    const [updatetransaction] = await db.promise().query(query);

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
    const filed = [
      "id",
      "date",
      "type",
      "amount",
      "description",
      "paidBy",
      "bank",
      "paymentStatus",
      "transactionLabel",
      "color",
    ];
    const query = `SELECT ${filed.toString()} FROM transaction WHERE isDeleted = 0`;
    const [transaction] = await db.promise().query(query);

    if (!transaction || transaction.length === 0) {
      throw new Error("no data found");
    }

    const Data = Promise.all(
      transaction.map(async (value) => {
        const [uname] = await db
          .promise()
          .query(`SELECT name FROM user WHERE id = ${value.paidBy}`);

        const [label] = await db
          .promise()
          .query(
            `select name from label_category where id = ${value.transactionLabel}`
          );

        const [bank] = await db
          .promise()
          .query(`select bankNickName from bank where id = ${value.bank}`);

        const name = uname && uname[0] ? uname[0].name : "";
        const labelname = label && label[0] ? label[0].name : "";
        const bankname = bank && bank[0] ? bank[0].bankNickName : "";
        return { ...value, name, labelname, bankname };
      })
    );

    res.status(200).json({
      status: "success",
      message: "get all data of bank",
      transaction: await Data,
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
    const transactionId = req.query.id;
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
