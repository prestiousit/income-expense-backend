const moment = require("moment");
const db = require("../../../config/database");
const {
  bankTabel,
  userTabel,
  labelcategoryTabel,
  transactionTabel,
} = require("../../../database/tabelName");
const { jwtTokenVerify, hasMonthChanged } = require("../../../helper/methods");
const bankCreate = async (req, res) => {
  try {
    let { banknickname, amount, user, status, bankLabel } = req.body;

    if (!user) {
      throw new Error("User is Required..!");
    } else if (!banknickname) {
      throw new Error("Bank Nick Name is Required..!");
    } else if (!amount) {
      throw new Error("Amount is Required..!");
    }

    if (!status) {
      req.body.status = "active";
    }

    req.body.status = "active";
    req.body.isDeleted = 0;
    req.body.createdBy = "1";
    req.body.createdAt = moment().toISOString();

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

    const sql1 = `INSERT INTO ${transactionTabel} (bank , paidBy , amount ,transactionLabel,type,paymentStatus,date) VALUES (${
      bank.insertId
    },${user},${amount},${bankLabel},"Income","Paid",'${moment().toISOString()}')`;
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

    req.body.updatedAt = moment();
    req.body.updatedBy = tokenData.id;

    const updateFields = Object.keys(req.body)
      .map((key) => {
        if (req.body[key] !== null) {
          req.body[key] = `'${req.body[key]}'`;
        }
        return `${key} = ${req.body[key]}`;
      })
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
    const month = req.body.month || moment().month() + 1;
    const year = req.body.year || moment().year();

    const carryForwordSelctQuery = `select id,data from bank_carry_forward where month = ${month} AND year = '${year}'`;
    let [carryData] = await db.promise().query(carryForwordSelctQuery);

    if(!carryData || carryData.length == 0){
      const bankCarryForwordQuery = `INSERT INTO bank_carry_forward (month, year, data) VALUES (${month}, ${year}, '{}');`;
      const [res] = await db.promise().query(bankCarryForwordQuery);
      [carryData] = await db.promise().query(carryForwordSelctQuery)
      console.log(carryData);
    }

    const carryForwordData = carryData && carryData[0]?.data;
    const carryForwordid = carryData && carryData[0]?.id;

    const lastMonthQuery = `select id,data from bank_carry_forward where id = ${
      carryForwordid ? carryForwordid - 1   : 0 
    }`;
    const [lastMonth] = await db.promise().query(lastMonthQuery);

    console.log(carryForwordData);

    const sql = `
      SELECT b.id, b.bankName, b.bankNickName, b.amount, b.user AS userid, b.bankLabel AS labelid, b.bankBranch, b.accountNo, b.IFSC_code, b.mobileNo, u.name AS username,
      b.description, l.name AS bankLabel, b.status, b.color, COALESCE(credit, 0) AS credit, COALESCE(debit, 0) AS debit, COALESCE(credit, 0) - COALESCE(debit, 0) AS total
      FROM bank b
      LEFT JOIN user u ON b.user = u.id
      LEFT JOIN labelcategory l ON b.bankLabel = l.id
      LEFT JOIN
      (
          SELECT bank, SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) AS credit ,
              SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) AS debit
          FROM transaction WHERE paymentStatus = 'Paid' AND isDeleted = 0 AND MONTH(date) = ${month} AND YEAR(date) = ${year}
          GROUP BY bank
      ) t ON b.id = t.bank WHERE b.isDeleted = 0 `;

    const [Data] = await db.promise().query(sql);

    const bankCarryForword = Data.map((el) => {
      const { id, bankNickName, total } = el;

      const carryForword = {
        id,
        bankNickName,
        total,
      };
      return carryForword;
    });
    const jsonString = JSON.stringify(bankCarryForword);
    if (carryData) {
      const bankCarryForwordQuery = `UPDATE bank_carry_forward SET data = '${jsonString}' WhERE id = ${carryForwordid}`;
      await db.promise().query(bankCarryForwordQuery);
    } else {
      const bankCarryForwordQuery = `INSERT INTO bank_carry_forward (month, year, data) VALUES (${month}, ${year}, '${jsonString}');`;
      await db.promise().query(bankCarryForwordQuery);
    }

    Data.map((el) => {
      el.credit = 1000 + +(el.credit)
      el.total = 1000 + +(el.total)
    });

    lastMonth.map((el)=>console.log(el))

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

    const deleteQuery = `UPDATE ${bankTabel} SET isDeleted = 1, deletedAt = '${moment()}', deletedBy = ${
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
