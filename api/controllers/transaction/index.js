const moment = require("moment");
const db = require("../../../config/database");
const {
  transactionTabel,
  userTabel,
  labelcategoryTabel,
  bankTabel,
} = require("../../../database/tabelName");
const { jwtTokenVerify } = require("../../../helper/methods");
const { bankCarryForword } = require("../../../helper/carryforword");
const transactionCreate = async (req, res) => {
  try {
    const tokenData = await jwtTokenVerify(req.headers.token);
    let {
      date,
      type,
      amount,
      paidBy,
      description,
      bank,
      paymentStatus,
      transactionLabel,
      color,
    } = req.body;

    if (typeof bank === "string") {
      if (!amount || !paidBy) {
        throw new Error("Amount or Paid Persone Required..!");
      }

      const findNickName = `select * from bank where bankNickName = '${bank}'`;
      const [findNickNameData] = await db.promise().query(findNickName);

      if (!findNickNameData[0]) {
        const sql = `INSERT INTO ${bankTabel} (banknickname,amount,user,isDeleted,status,createdAt,createdBy )
        VALUES ('${bank}' , 0 ,${paidBy},0,'active','${moment().toISOString()}',${
          tokenData.id
        })`;
        const [data] = await db.promise().query(sql);
        bank = data.insertId;
      }else{
        bank = findNickNameData[0].id
      }
    }
    if (!transactionLabel) {
      transactionLabel = null;
    }
    if (!type) {
      type = "Income";
    }
    const field = [
      "date",
      "credit",
      "debit",
      "type",
      "description",
      "paidby",
      "bank",
      "paymentStatus",
      "transactionLabel",
      "color",
      "isDeleted",
      "createdBy",
      "createdAt",
    ];
    const isDeleted = 0;
    const createdBy = tokenData.id;
    const createdAt = moment().toISOString();
    const value = [
      `'${date}'`,
      `'${(credit = type === "Income" ? amount : 0)}'`,
      `'${(debit = type === "Expense" ? amount : 0)}'`,
      `'${type}'`,
      `'${description}'`,
      `'${paidBy}'`,
      `'${bank}'`,
      `'${paymentStatus}'`,
      `'${transactionLabel}'`,
      `'${color}'`,
      `'${isDeleted}'`,
      `'${createdBy}'`,
      `'${createdAt}'`,
    ];

    const query = `INSERT INTO ${transactionTabel} (${field}) VALUES (${value})`;
    const [transaction] = await db.promise().query(query);

    const selectQuery = `SELECT * FROM ${bankTabel} WHERE id  = ${bank}`;
    const [data] = await db.promise().query(selectQuery);

    let currentAmount = +data[0].amount;
    if (type === "Income") {
      currentAmount += amount;
    } else if (type === "Expense") {
      currentAmount -= amount;
    }

    const updateBankQuery = `UPDATE ${bankTabel} SET amount = ${currentAmount} WHERE id = ${bank}`;
    await db.promise().query(updateBankQuery);

    bankCarryForword(req.body.date);

    res.status(201).json({
      status: "sucess",
      message: "transaction Inserted successfully",
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
    const { type, amount } = req.body;

    req.body.updatedAt = new Date();
    req.body.updatedBy = tokenData.id;
    const selectQuery = `SELECT * FROM ${transactionTabel} WHERE id = ${transactionId}`;
    const [transaction] = await db.promise().query(selectQuery);
    if (!transaction || transaction.length === 0) {
      throw new Error("transaction not found");
    }
    // let bodyAmount = req.body.amount;
    let updateFields = Object.keys(req.body)
      .map((key) => {
        if (req.body[key] !== null) {
          req.body[key] = `'${req.body[key]}'`;
        }
        return `${key} = ${req.body[key]}`;
      })
      .join(", ");

    let currentAmount;

    if (transaction[0].type === "Income") {
      currentAmount = transaction[0].credit;
    } else if (transaction[0].type === "Expense") {
      currentAmount = transaction[0].debit;
    }

    const bankSelctQuery = `SELECT amount,id FROM ${bankTabel} WHERE id = ${transaction[0].bank}`;
    const [bankAmount] = await db.promise().query(bankSelctQuery);

    let bankAmountUpdate = +bankAmount[0].amount;

    if (type === "Income") {
      bankAmountUpdate += currentAmount;
      bankAmountUpdate += amount;
      updateFields += `,credit = '${amount}',debit = 0`;
    } else if (type === "Expense") {
      bankAmountUpdate -= currentAmount;
      bankAmountUpdate -= amount;
      updateFields += `,credit = 0,debit = '${amount}'`;
    }

    let query = `UPDATE ${transactionTabel} SET ${updateFields} WHERE id = ${transactionId}`;
    query = query.replace(/,\s*amount\s*=\s*'[^']*'/i, "");
    const [updatedTransaction] = await db.promise().query(query);

    const bankUpdateAmountQuery = `UPDATE ${bankTabel} SET amount = ${bankAmountUpdate} where id = ${transaction[0].bank}`;
    await db.promise().query(bankUpdateAmountQuery);

    bankCarryForword(transaction[0].date);

    res.status(200).json({
      status: "success",
      message: "transaction updated successfully",
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
    const month = req.body.month || moment().month() + 1;
    const year = req.body.year || moment().year();

    const sql = `SELECT t.id, t.date,t.debit,t.credit,t.type, t.bank AS bankid, t.description, u.name, t.paidBy AS userid, b.bankNickName, t.paymentStatus, t.transactionLabel AS labelid, l.name AS label, t.color
    FROM transaction t
    LEFT OUTER JOIN user u ON t.paidBy = u.id
    LEFT OUTER JOIN labelcategory l ON t.transactionLabel = l.id
    LEFT OUTER JOIN bank b ON t.bank = b.id
    WHERE t.isDeleted = 0 ${
      month == "all"
        ? ""
        : `AND MONTH(t.date) = ${month} AND YEAR(t.date) = ${year}`
    } 
    ORDER BY t.date ASC;`;

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
    const monthYearSql = `SELECT DISTINCT LEFT(DATE_FORMAT(date, '%M'), 3) AS month, YEAR(date) AS year FROM transaction
    WHERE isDeleted = 0 
    ORDER BY year ASC, FIELD(month, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec')`;
    const [monthYearData] = await db.promise().query(monthYearSql);
    res.status(200).json({
      status: "success",
      message: "get all data of bank",
      transaction: data,
      monthYearData,
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
    LEFT OUTER JOIN (SELECT id,credit as credit FROM transaction WHERE type='Income') credit ON t.id = credit.id
    LEFT OUTER JOIN (SELECT id,debit as debit FROM transaction WHERE type='Expense') debit ON t.id = debit.id WHERE t.id=${transactionId} AND paymentStatus = 'Paid'`;
    const [bankdata] = await db.promise().query(query_bank);
    const deleteQuery = `UPDATE ${transactionTabel} SET isDeleted = 1, deletedAt='${new Date()}',deletedBy = ${
      tokenData.id
    } WHERE id = ${transactionId}`;
    const [deletetransaction] = await db.promise().query(deleteQuery);
    const query_bank_amount = `UPDATE ${bankTabel} SET amount = amount - ${Math.abs(
      bankdata[0].debit - bankdata[0].credit
    )} WHERE id=${bankdata[0].bank}`;
    [bankamount] = await db.promise().query(query_bank_amount);
    bankCarryForword(transaction[0].date);

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
