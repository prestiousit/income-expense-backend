const moment = require("moment");
const db = require("../config/database");
const { transactionTabel, bankTabel } = require("../database/tabelName");

async function bankCarryForword(date) {

  let month = moment(date || moment().toISOString()).month() + 1;
  let year = moment(date || moment().toISOString()).year();

  const transactionSelectQuery = `
  SELECT t.bank,
  COALESCE(SUM(CASE WHEN MONTH(t.date) < ${month} AND YEAR(t.date) <= ${year} THEN credit ELSE 0 END), 0) AS total_credit,
  COALESCE(SUM(CASE WHEN MONTH(t.date) < ${month} AND YEAR(t.date) <= ${year} THEN debit ELSE 0 END), 0) AS total_debit,
  COALESCE(SUM(CASE WHEN MONTH(t.date) = ${month} AND YEAR(t.date) = ${year} THEN credit ELSE 0 END), 0) AS credit,
  COALESCE(SUM(CASE WHEN MONTH(t.date) = ${month} AND YEAR(t.date) = ${year} THEN debit ELSE 0 END), 0) AS debit
  FROM ${transactionTabel} t
  LEFT JOIN ${bankTabel} b ON b.id = t.bank
  WHERE t.isDeleted = 0 AND YEAR(t.date) <= ${year} AND paymentStatus = 'Paid'
  GROUP BY t.bank, b.bankNickName;
`;

  let [transactionData] = await db.promise().query(transactionSelectQuery);


  const findCarryQuery = `select * from bank_carry_forward where month=${month} AND year=${year}`;
  const [findCarryData] = await db.promise().query(findCarryQuery);

  // const findBankFromCarry = `select * from bank_carry where month=${month - 1} AND year=${year - 1}`
  // const [findBankFromCarryData] = await db.promise().query(findBankFromCarry);

  const opdata = transactionData.map((el) => {
    let opbank = {
      "credit": (+el.total_credit - +el.total_debit)+ +el.credit || 0,
      "debit": +el.debit || 0,
      "total": (+el.total_credit - +el.total_debit)+(+el.credit - +el.debit) || 0
    };

    let op = {};
    op[el.bank] = opbank;

    return op;
  });

  console.log("\n\n\n\n\ntransactionData==========>", transactionData);


  const data = JSON.stringify(opdata);
  console.log("\n\n\n\n\nopdata==========>", data);

  if (!findCarryData.length) {
    const insertCarry = `INSERT INTO bank_carry_forward (month, year, data) VALUES ('${month}', '${year}', '${data}');`;
    await db.promise().query(insertCarry);

    // monthupdate(month,year);
  } else {
    const updateCarry = `UPDATE bank_carry_forward SET data = '${data}' where id=${findCarryData[0].id};`;
    await db.promise().query(updateCarry);

    monthupdate(month,year);
  }
}

async function carryForwordGet(month, year) {
  const findCarryQuery = `
    SELECT * 
    FROM bank_carry_forward 
    WHERE month <= ${month} AND year = ${year} 
    ORDER BY year DESC, month DESC 
    LIMIT 1;
  `;

  try {
    const [findCarryData] = await db.promise().query(findCarryQuery);

    const bankData = findCarryData ? findCarryData : [];

    console.log("\n\n\nbankData========", bankData);
    return bankData;
  } catch (error) {
    console.error("Error in carryForwordGet:", error);
    throw error;
  }
}

async function monthupdate(month,year){
  const getMonthsSql = `select * from bank_carry_forward WHERE (year > ${year}) OR (year = ${year} AND month > ${month})`;
    const [getMonthsData] = await db.promise().query(getMonthsSql);

    console.log("\n\n\n\ngetMonthsData=======", getMonthsData);
    for (let i = 0; i < getMonthsData.length; i++) {

    const getCarry = `select * from bank_carry_forward where month = ${getMonthsData[i].month} and year = ${getMonthsData[i].year}`;

    let getCarryData = await db.promise().query(getCarry);


    console.log("\n\n\ngetCarryData data in month function === " , getCarryData);

      // const opdata = transactionData.map((el) => {
      //   let opbank = {
      //     "credit": (+el.total_credit - +el.total_debit)+ +el.credit || 0,
      //     "debit": +el.debit || 0,
      //     "total": (+el.total_credit - +el.total_debit)+(+el.credit - +el.debit) || 0
      //   };
    
      //   let op = {};
      //   op[el.bank] = opbank;
    
      //   return op;
      // });

      // const data = JSON.stringify(opdata);

      // console.log("\n\n\n updated data in month function-----------", data);

      // const updateCarry = `UPDATE bank_carry_forward SET data = '${data}' where id=${getMonthsData[i].id};`;
      // await db.promise().query(updateCarry);
    }
}
module.exports = { bankCarryForword, carryForwordGet };
