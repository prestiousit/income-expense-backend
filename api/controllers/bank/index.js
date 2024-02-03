const moment = require("moment");
const db = require("../../../config/database");
const {
  bankTabel,
  userTabel,
  labelcategoryTabel,
  transactionTabel,
} = require("../../../database/tabelName");
const { jwtTokenVerify, hasMonthChanged } = require("../../../helper/methods");
const { carryForwordGet } = require("../../../helper/carryforword");

const bankCreate = async (req, res) => {
  try {
    // let { banknickname, amount, user, status, bankLabel,color, } = req.body;
    let {accountno,
      amount,
      bankbranch,
      bankname,
      banknickname,
      color,
      credit,
      debit,
      description,
      ifsc_code,
      mobileNo,
      status,
      total,
      user}= req.body;

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

    console.log("query===>", req.body)
    const sql = `INSERT INTO ${bankTabel}
      (user, bankname, banknickname, accountno, ifsc_code, mobileNo, bankbranch, amount, description, color, status, isDeleted, createdBy, createdAt)
       VALUES (${user}, ${bankname}, ${banknickname}, ${accountno}, ${ifsc_code}, ${mobileNo}, ${bankbranch}, ${amount}, ${description}, ${color}, ${req.body.status}, ${req.body.isDeleted}, ${req.body.createdBy}, ${req.body.createdAt})`;

    console.log("query===>", sql);
    const [bank] = await db.promise().query(sql);
    if (!bankLabel) {
      bankLabel = "null";
    }

    console.log("bank====",bank);

    const sql1 = `INSERT INTO ${transactionTabel} (bank , paidBy , credit ,transactionLabel,type,paymentStatus,date) VALUES (${
      bank.insertId},${user},${amount},${bankLabel},"Income","Paid",'${moment().toISOString()}')`;
    console.log("sqlll===>", sql1);
    const [transaction] = await db.promise().query(sql1);

    res.status(201).json({
      status: "sucess",
      message: "bank Inserted successfully",
      data: bank,
      transaction: transaction,
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

    const carryForwordData = await carryForwordGet(month, year);

    // const sql = `
    //   SELECT b.id, b.bankName, b.bankNickName, b.amount, b.user AS userid, b.bankLabel AS labelid, b.bankBranch, b.accountNo, b.IFSC_code, b.mobileNo, u.name AS username,
    //   b.description, l.name AS bankLabel, b.status, b.color, COALESCE(credit, 0) AS credit, COALESCE(debit, 0) AS debit, COALESCE(credit, 0) - COALESCE(debit, 0) AS total
    //   FROM bank b
    //   LEFT JOIN user u ON b.user = u.id
    //   LEFT JOIN labelcategory l ON b.bankLabel = l.id
    //   LEFT JOIN
    //   (
    //       SELECT bank, SUM(credit) AS credit ,SUM(debit) AS debit
    //       FROM transaction WHERE paymentStatus = 'Paid' AND isDeleted = 0 AND MONTH(date) <= ${month} AND YEAR(date) <= ${year}
    //       GROUP BY bank
    //   ) t ON b.id = t.bank WHERE b.isDeleted = 0 `;

    const sql = `
    SELECT  b.id, b.bankName, b.bankNickName, b.amount, b.user AS userid,  b.bankLabel AS labelid, b.bankBranch, b.accountNo, b.IFSC_code, b.mobileNo, u.name AS username,b.description, l.name AS bankLabel, b.status, b.color,
    COALESCE(SUM(t.credit), 0) AS credit,COALESCE(SUM(t.debit), 0) AS debit,COALESCE(SUM(t.credit - t.debit), 0) AS total
    FROM bank b
    LEFT JOIN transaction t ON t.bank = b.id 
    LEFT JOIN user u ON b.user = u.id
    LEFT JOIN labelcategory l ON b.bankLabel = l.id 
    WHERE MONTH(t.date) <= ${month} AND YEAR(t.date) <= ${year}
    GROUP BY b.id;`;
    
    const [Data] = await db.promise().query(sql);

    const query = `
    select b.id,COALESCE(SUM(t.credit), 0) AS credit,COALESCE(SUM(t.debit), 0) AS debit,COALESCE(SUM(t.credit - t.debit), 0) AS total
    from  transaction t
    left join bank b on b.id = t.bank
    WHERE MONTH(t.date) = ${month} AND YEAR(t.date) = ${year} group by bank
    `
    const [currentData] = await db.promise().query(query);

    console.log("\n\n\n\n\nData=========>",Data);
    console.log("\n\n\n\n\currentData=========>",carryForwordData);

    let data = Data;

    // if (carryForwordData) {
    //   for (let i = 0; i < Data.length; i++) {
    //     for (let j = 0; j <= carryForwordData.length; j++) {
    //       let carryForword = carryForwordData[j].split(":"); 
    //       if (data[i].id == carryForword[0]) {
    //         let currentCredit = currentData.length !=0 ? currentData[i].credit : 0;
    //         let currentDebit = currentData.length !=0 ? currentData[i].debit : 0;
    //         console.log("\n\n\n\ndata[i].credit====",+data[i].credit,+data[i].debit);
    //         console.log("\n\n\n\ncarryforward====",carryForwordData[j]);
    //         console.log("\n\n\n\n,+currentCredit=>",+currentCredit)
    //         data[i].credit = +carryForword[1] + +currentCredit;
    //         data[i].debit = +currentDebit;
    //       }
    //     }
    //   }
    // }


    res.status(200).json({
      status: "success",
      message: "get adata of bank",
      data ,
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
