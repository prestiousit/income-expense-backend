const moment = require("moment");
const db = require("../../../config/database");
const {
  bankTabel,
  userTabel,
  labelcategoryTabel,
  transactionTabel,
} = require("../../../database/tabelName");
const { jwtTokenVerify, hasMonthChanged } = require("../../../helper/methods");
const {
  carryForwordGet,
  bankCarryForword,
} = require("../../../helper/carryforword");

const bankCreate = async (req, res) => {
  try {
    // let { banknickname, amount, user, status, bankLabel,color, } = req.body;
    let {
      accountno,
      amount,
      bankbranch,
      bankname,
      banknickname,
      color,
      description,
      ifsc_code,
      mobileNo,
      status,
      user,
      bankLabel,
    } = req.body;

    const checkBankQuery = `select * from ${bankTabel} where BankNickName = '${banknickname}'`;
    const  [checkBankData] = await db.promise().query(checkBankQuery);
    if(checkBankData[0]) throw new Error("bank already exist..!");

    if (!user) {
      throw new Error("User is Required..!");
    } else if (!banknickname) {
      throw new Error("Bank Nick Name is Required..!");
    } else if (!amount) {
      throw new Error("Amount is Required..!");
    } else if (!status) {
      req.body.status = "active";
    } else if (!bankLabel) {
      bankLabel = null;
    }

    req.body.isDeleted = 0;
    req.body.createdBy = "1";
    req.body.createdAt = moment().toISOString();

    // const keys = Object.keys(req.body)
    //   .map((key) => `${key}`)
    //   .join(", ");

    // const keyvalues = Object.keys(req.body)
    //   .map((key) => `'${req.body[key]}'`)
    //   .join(", ");

    const sql = `INSERT INTO ${bankTabel}
      (user, bankname, banknickname, accountno, ifsc_code, mobileNo,bankLabel, bankbranch, amount, description, color, status, isDeleted, createdBy, createdAt)
       VALUES (${user}, '${bankname}', '${banknickname}', '${accountno}', '${ifsc_code}', '${mobileNo}',${bankLabel}, '${bankbranch}', ${amount}, '${description}',' ${color}', '${req.body.status}', ${req.body.isDeleted}, ${req.body.createdBy}, '${req.body.createdAt}')`;

    const [bank] = await db.promise().query(sql);

    const sql1 = `INSERT INTO ${transactionTabel} (bank , paidBy , credit ,debit ,transactionLabel,type,paymentStatus,date,description, isDeleted, createdBy, createdAt, firstentry) VALUES (${
      bank.insertId
    },${user},${amount},0,${bankLabel},"Income","Paid",'${moment().toISOString()}',"bank added", ${req.body.isDeleted}, ${req.body.createdBy}, '${req.body.createdAt}',1)`;
    const [transaction] = await db.promise().query(sql1);

    bankCarryForword(req.body.date, transaction.insertId);

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

    const sql = `
    SELECT  b.id, b.bankName, b.bankNickName, b.user AS userid,  b.bankLabel AS labelid, b.bankBranch, b.accountNo, b.IFSC_code, b.mobileNo, u.name AS username,b.description, l.name AS bankLabel, b.status, b.color
    FROM bank b
    LEFT JOIN transaction t ON t.bank = b.id 
    LEFT JOIN user u ON b.user = u.id
    LEFT JOIN labelcategory l ON b.bankLabel = l.id 
    WHERE ((YEAR(t.date) < ${year}) OR (YEAR(t.date) = ${year} AND MONTH(t.date) <= ${month}) OR t.date IS NULL)
      AND b.isDeleted = 0
    GROUP BY b.id;`;

    const [Data] = await db.promise().query(sql);

    let bankCarryData =carryForwordData && carryForwordData[0] ? [carryForwordData[0].data] : [];

    Data.forEach((dataObject) => {
      const bankId = dataObject.id.toString();

      console.log("\n\nbbb==",bankCarryData[0],bankCarryData);
      const correspondingBankCarryData = bankCarryData[0].find(
        (el) => el.bank === +bankId
      );
      if (correspondingBankCarryData) {
        const { credit, debit, total } = correspondingBankCarryData;
        dataObject.credit = credit;
        dataObject.debit = debit;
        dataObject.total = total;
      } else {
        dataObject.credit = +dataObject.total;
        dataObject.debit = 0;
        dataObject.total = +dataObject.total;
      }
    });

    const monthSql = `select distinct month as value , LEFT(DATE_FORMAT(concat(year,'-',month,'-01'), '%M'), 3) AS label from bank_carry_forward ORDER BY month ASC`;
    const [monthData] = await db.promise().query(monthSql);

    const yearSql = `select distinct year as value , year AS label from bank_carry_forward`;
    const [yearData] = await db.promise().query(yearSql);

    console.log("\n\nmonth===",monthData,yearData);
    res.status(200).json({
      status: "success",
      message: "get adata of bank",
      data: Data,
      monthData,
      yearData,
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
    
    const checkTranscationQuery = `select * from ${transactionTabel} where bank = ${bankId} AND isDeleted = 0`
    const [checkTransaction] = await db.promise().query(checkTranscationQuery);

    if (checkTransaction.length === 0) {
      const deleteQuery = `UPDATE ${bankTabel} SET isDeleted = 1, deletedAt = '${moment()}', deletedBy = ${
        tokenData.id
      } WHERE id = ${bankId}`;
      const [deletebank] = await db.promise().query(deleteQuery);

      const transactionId = checkTransaction[0].id
      const deleteTransactionQuery = `UPDATE ${transactionTabel} SET isDeleted = 1, deletedAt='${new Date()}',deletedBy = ${
        tokenData.id
      } WHERE id = ${transactionId}`;
  
      // await db.promise().query(deleteTransactionQuery);

      const carryForwordQuery = `SELECT * FROM bank_carry_forward WHERE JSON_CONTAINS(data, '{"bank": ${bankId}}', '$') order by month`;
      const [carryData] = await db.promise().query(carryForwordQuery);

      await Promise.all(
        carryData.map(async(el)=>{
          const newData = el.data.filter(((el)=>el.bank !=  bankId));
          const stringify = JSON.stringify(newData);
          const updateQuery = `update bank_carry_forward set data = '${stringify}' where id = ${el.id}`;
          await db.promise().query(updateQuery);
        })
      )
    }else{
      throw new Error('Bank still used in Transactions..!');
    }

    res.status(200).json({
      status: "success",
      message: "bank Deleted successfully",
      checkTransaction:checkTransaction.length
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
