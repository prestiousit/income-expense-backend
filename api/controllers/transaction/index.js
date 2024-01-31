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
    let { date, type, amount, bank, paymentStatus, paidBy } = req.body;
    req.body.isDeleted = 0;
    req.body.createdBy = tokenData.id;
    req.body.createdAt = moment().toISOString();


    if (typeof bank === "string") {
      if (!amount || !paidBy) {
        throw new Error("Amount or Paid Persone Required..!");
      }
      const sql = `INSERT INTO ${bankTabel} (banknickname,amount,user,isDeleted,status,createdAt,createdBy )
                   VALUES ('${bank}' , 0 ,${paidBy},0,'active','${moment().toISOString()}',${tokenData.id})`;
      const [data] = await db.promise().query(sql);
      req.body.bank = data.insertId;
    }

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
    
    let bankamount;
    if (bankdata.length > 0) {
      const selectQuery = `SELECT * FROM ${bankTabel} WHERE id  = ${bankdata[0].bank}`;
      const [data] = await db.promise().query(selectQuery);

      if (bankdata[0].credit) {
        const query_bank_amount = `UPDATE ${bankTabel} SET amount = amount + ${bankdata[0].credit} WHERE id=${req.body.bank}`;
        [bankamount] = await db.promise().query(query_bank_amount);
      } else if (bankdata[0].debit) {
        const query_bank_amount = `UPDATE ${bankTabel} SET amount = amount - ${bankdata[0].debit} WHERE id=${req.body.bank}`;
        [bankamount] = await db.promise().query(query_bank_amount);
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

    let bodyAmount = req.body.amount;
    const updateFields = Object.keys(req.body)
      .map((key) => {
        if (req.body[key] !== null) {
          req.body[key] = `'${req.body[key]}'`;
        }
        return `${key} = ${req.body[key]}`;
      })
      .join(", ");
    const query = `UPDATE ${transactionTabel} SET ${updateFields}WHERE id = ${transactionId}`;
    const [updatedTransaction] = await db.promise().query(query);

    const query_bank = `
    SELECT t.id,t.bank,t.amount,type,credit.credit as credit,debit.debit as debit
    FROM transaction t
    LEFT OUTER JOIN (SELECT id,amount as credit FROM transaction WHERE type='Income') credit ON t.id = credit.id
    LEFT OUTER JOIN (SELECT id,amount as debit FROM transaction WHERE type='Expense') debit ON t.id = debit.id WHERE t.isDeleted = 0 AND bank=${req.body.bank} AND t.id=${transactionId} AND paymentStatus = 'Paid'`;
    const [bankdata] = await db.promise().query(query_bank);

    const bank_amount_query = `
    SELECT amount FROM ${bankTabel} WHERE id=${req.body.bank}`;
    const [bank_amount] = await db.promise().query(bank_amount_query);
    let oldAmount = bank_amount[0].amount;
    // console.log("bank_amount=============>", transaction[0].amount);

    let newValue = oldAmount;
    if (bankdata[0].type !== transaction[0].type) {
      if (bankdata[0].type === "Expense") {
        newValue -= transaction[0].amount;
        newValue -= bodyAmount;
      }
      if (bankdata[0].type === "Income") {
        newValue = +transaction[0].amount + +newValue;
        newValue = +bodyAmount + +newValue;
      }
    } else {
      newValue -= transaction[0].amount;
      newValue += bodyAmount;
    }
    // console.log("milan=>", newValue, transaction[0].amount, bodyAmount);
    const query_bank_amount = `UPDATE ${bankTabel} SET amount = ${newValue} WHERE id=${req.body.bank}`;
    const [bankamount] = await db.promise().query(query_bank_amount);

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
    
    console.log("body====>",req.body);

    const sql = `SELECT t.id, t.date, t.bank AS bankid, t.type, t.amount, t.description, u.name, t.paidBy AS userid, b.bankNickName, t.paymentStatus, t.transactionLabel AS labelid, l.name AS label, t.color, credit.credit AS credit, debit.debit AS debit
    FROM transaction t
    LEFT OUTER JOIN user u ON t.paidBy = u.id
    LEFT OUTER JOIN labelcategory l ON t.transactionLabel = l.id
    LEFT OUTER JOIN bank b ON t.bank = b.id
    LEFT OUTER JOIN (SELECT id, amount AS credit FROM transaction WHERE type='Income') credit ON t.id = credit.id
    LEFT OUTER JOIN (SELECT id, amount AS debit FROM transaction WHERE type='Expense') debit ON t.id = debit.id
    WHERE t.isDeleted = 0 
    ORDER BY t.date ASC;`

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
    const query_bank = `
    SELECT t.id,t.bank,COALESCE(credit.credit, 0) as credit, COALESCE(debit.debit, 0) as debit
    FROM transaction t
    LEFT OUTER JOIN (SELECT id,amount as credit FROM transaction WHERE type='Income') credit ON t.id = credit.id
    LEFT OUTER JOIN (SELECT id,amount as debit FROM transaction WHERE type='Expense') debit ON t.id = debit.id WHERE t.id=${transactionId} AND paymentStatus = 'Paid'`;
    const [bankdata] = await db.promise().query(query_bank);
    const deleteQuery = `UPDATE ${transactionTabel} SET isDeleted = 1, deletedAt='${new Date()}',deletedBy = ${
      tokenData.id
    } WHERE id = ${transactionId}`;
    const [deletetransaction] = await db.promise().query(deleteQuery);
    const query_bank_amount = `UPDATE ${bankTabel} SET amount = amount - ${Math.abs(
      bankdata[0].debit - bankdata[0].credit
    )} WHERE id=${bankdata[0].bank}`;
    [bankamount] = await db.promise().query(query_bank_amount);
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
