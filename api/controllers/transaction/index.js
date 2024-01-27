const moment = require("moment");
const db = require("../../../config/database");
const {
  transactionTabel,
  userTabel,
  labelcategoryTabel,
  bankTabel,
} = require("../../../database/tabelName");
const { jwtTokenVerify } = require("../../../helper/methods");

const transactionCreate = async (req, res) => {
  try {
    const tokenData = await jwtTokenVerify(req.headers.token);
    let { date, type, amount, bank, paymentStatus } = req.body;
    // if (!date || !type || !amount || !bank || !paymentStatus) {
    //   throw new Error("Fields are required.");
    // }

    req.body.isDeleted = 0;
    req.body.createdBy = tokenData.id;
    req.body.createdAt = moment();
    const field = Object.keys(req.body)
      .map((key) => key)
      .toString();
    const value = Object.keys(req.body)
      .map((key) => `'${req.body[key]}'`)
      .toString();

    const query = `INSERT INTO ${transactionTabel} (${field}) VALUES (${value})`;
    console.log("query=============>", query);
    const [transaction] = await db.promise().query(query);

    const query_bank = `
    SELECT t.id,t.bank,credit.credit as credit,debit.debit as debit
    FROM transaction t
    LEFT OUTER JOIN (SELECT id,amount as credit FROM transaction WHERE type='Income') credit ON t.id = credit.id
    LEFT OUTER JOIN (SELECT id,amount as debit FROM transaction WHERE type='Expense') debit ON t.id = debit.id WHERE t.isDeleted = 0 AND bank=${req.body.bank} AND t.id=${transaction.insertId} AND paymentStatus = 'Paid'`;

    const [bankdata] = await db.promise().query(query_bank);

    // console.log("value====>",bankdata);

    const selectQuery = `SELECT * FROM ${bankTabel} WHERE id  = ${bankdata[0].bank}`;

    const [data] = await db.promise().query(selectQuery);
    console.log("data====>", data);

    const dataDate = moment(data[0].createdAt).format("DD-MM-YYYY hh-mm");
    const submitData = moment(req.body.createdAt).format("DD-MM-YYYY hh-mm");

    let bankamount;
    if (dataDate !== submitData) {
      if (bankdata.length > 0) {
        if (bankdata[0].credit) {
          const query_bank_amount = `UPDATE ${bankTabel} SET amount = amount + ${bankdata[0].credit} WHERE id=${req.body.bank}`;
          [bankamount] = await db.promise().query(query_bank_amount);
        } else if (bankdata[0].debit) {
          const query_bank_amount = `UPDATE ${bankTabel} SET amount = amount - ${bankdata[0].debit} WHERE id=${req.body.bank}`;
          [bankamount] = await db.promise().query(query_bank_amount);
        }
      }
    }

    res.status(201).json({
      status: "sucess",
      message: "transaction Inserted successfully",

      data: transaction,
      bank: bankdata,
      // bankamount:bankamount
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
    const tokenData = await jwtTokenVerify(req.headers.token);
    req.body.updatedAt = new Date();
    req.body.updatedBy = tokenData.id;
    const selectQuery = `SELECT * FROM ${transactionTabel} WHERE id = ${transactionId}`;
    const [transaction] = await db.promise().query(selectQuery);
    if (!transaction || transaction.length === 0) {
      throw new Error("transaction not found");
    }
    const updateFields = Object.keys(req.body)
      .map((key) => `${key} = '${req.body[key]}'`)
      .join(", ");
    const query = `UPDATE ${transactionTabel} SET ${updateFields}WHERE id = ${transactionId}`;
    const [updatedTransaction] = await db.promise().query(query);
    const query_bank = `
    SELECT t.id,t.bank,credit.credit as credit,debit.debit as debit
    FROM transaction t
    LEFT OUTER JOIN (SELECT id,amount as credit FROM transaction WHERE type='Income') credit ON t.id = credit.id
    LEFT OUTER JOIN (SELECT id,amount as debit FROM transaction WHERE type='Expense') debit ON t.id = debit.id WHERE t.isDeleted = 0 AND bank=${req.body.bank} AND t.id=${transactionId} AND paymentStatus = 'Paid'`;
    const [bankdata] = await db.promise().query(query_bank);
    let bankamount;
    if (bankdata.length > 0) {
      let amountdata = 0;
      if (bankdata[0].credit < transaction[0].amount) {
        amountdata = transaction[0].amount - bankdata[0].credit;
        amountdata = `amount = amount - ${amountdata}`;
      } else if (bankdata[0].credit > transaction[0].amount) {
        amountdata = bankdata[0].credit - transaction[0].amount;
        amountdata = `amount = amount + ${amountdata}`;
      }
      console.log("\namount============>", amountdata);
      if (bankdata[0].credit) {
        const query_bank_amount = `UPDATE ${bankTabel} SET ${amountdata}  WHERE id=${req.body.bank}`;
        [bankamount] = await db.promise().query(query_bank_amount);
      } else if (bankdata[0].debit) {
        const transctionAmount = transaction[0].amount;
        if (transctionAmount > bankdata[0].debit) {
          amount = `amount = amount + ${bankdata[0].debit}`;
        } else if (transctionAmount > bankdata[0].debit) {
          amount = `amount = amount - ${bankdata[0].debit}`;
        }
        const query_bank_amount = `UPDATE ${bankTabel} SET ${amountdata} WHERE id=${req.body.bank}`;
        [bankamount] = await db.promise().query(query_bank_amount);
      }
    }
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
    const sql = `SELECT t.id,t.date,t.bank as bankid,t.type,t.amount,t.description,u.name,t.paidBy as userid,b.bankNickName,t.paymentStatus,t.transactionLabel as labelid,l.name as label,t.color,credit.credit as credit,debit.debit as debit
    FROM ${transactionTabel} t
    LEFT OUTER JOIN ${userTabel} u ON t.paidBy = u.id
    LEFT OUTER JOIN ${labelcategoryTabel} l ON t.transactionLabel = l.id
    LEFT OUTER JOIN ${bankTabel} b ON t.bank = b.id
    LEFT OUTER JOIN (SELECT id,amount as credit FROM ${transactionTabel} WHERE type='Income') credit ON t.id = credit.id
    LEFT OUTER JOIN (SELECT id,amount as debit FROM ${transactionTabel} WHERE type='Expense') debit ON t.id = debit.id WHERE t.isDeleted = 0;`;

    const [transaction] = await db.promise().query(sql);

    let total = 0;
    const data = transaction.map((el) => {
      if (!el.credit) {
        el.credit = 0;
      } else if (!el.debit) {
        el.debit = 0;
      }
      const credit = el.credit;
      const debit = el.debit;
      total = credit - debit + total;
      return { ...el, total };
    });
    res.status(200).json({
      status: "success",
      message: "get all data of bank",
      transaction: data,
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
    const tokenData = await jwtTokenVerify(req.headers.token);
    const query = `SELECT * FROM ${transactionTabel} WHERE id = ${transactionId}`;
    const [transaction] = await db.promise().query(query);

    if (!transaction || transaction.length === 0) {
      throw new Error("transaction not found");
    }

    const deleteQuery = `UPDATE ${transactionTabel} SET isDeleted = 1, deletedAt='${new Date()}',deletedBy = ${
      tokenData.id
    } WHERE id = ${transactionId}`;
    const [deletetransaction] = await db.promise().query(deleteQuery);

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
