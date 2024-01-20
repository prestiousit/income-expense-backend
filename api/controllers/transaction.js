const db = require("../../config/database");

const TransactionCreate = async (req, res) => {
  try {
    let {
      date,
      type,
      amount,
      description,
      paidby,
      bank,
      paymentStatus,
      transactionLabel,
      color,
    } = req.body;

    console.log(
      date,
      type,
      amount,
      description,
      paidby,
      bank,
      paymentStatus,
      transactionLabel,
      color
    );

    const [transaction] = await db
      .promise()
      .query(
        "INSERT INTO transaction (date,type,amount,description,paidby,bank,paymentStatus,transactionLabel,color,createdAt) VALUES (?,?,?,?,?,?,?,?,?,curdate())",
        [
          date,
          type,
          amount,
          description,
          paidby,
          bank,
          paymentStatus,
          transactionLabel,
          color,
        ]
      );

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
    let {
      date,
      type,
      amount,
      description,
      paidby,
      bank,
      paymentStatus,
      transactionLabel,
      color,
    } = req.body;

    date = date ?? transaction[0].date;
    type = type ?? transaction[0].type;
    amount = amount ?? transaction[0].amount;
    description = description ?? transaction[0].description;
    paidby = paidby ?? transaction[0].paidBy;
    bank = bank ?? transaction[0].bank;
    paymentStatus = paymentStatus ?? transaction[0].paymentStatus;
    transactionLabel = transactionLabel ?? transaction[0].transactionLabel;
    color = color ?? transaction[0].color;

    const [updatetransaction] = await db
      .promise()
      .query(
        "UPDATE transaction SET date=? ,type=? ,amount=? ,description=? ,paidBy=? ,bank=? ,paymentStatus=? ,transactionLabel=? ,color=? , updatedAt=curdate()  WHERE id = ?",
        [
          date,
          type,
          amount,
          description,
          paidby,
          bank,
          paymentStatus,
          transactionLabel,
          color,
          transactionId,
        ]
      );

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
      .query("SELECT id,date,type,amount,description,paidby,bank,paymentStatus,transactionLabel,color FROM transaction WHERE isDeleted = 0");

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
    const transactionId = req.query.id;
    const [transaction] = await db
      .promise()
      .query("SELECT * FROM transaction WHERE id = ?", [transactionId]);

    if (!transaction || transaction.length === 0) {
      throw new Error("transaction not found");
    }

    const [deletetransaction] = await db
      .promise()
      .query("UPDATE transaction SET isDeleted = 1, deletedAt=curdate() WHERE id = ?", [transactionId]);

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
  TransactionDelete
};
