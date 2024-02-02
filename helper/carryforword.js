const moment = require("moment");
const db = require("../config/database");
const { transactionTabel, bankTabel } = require("../database/tabelName");

async function bankCarryForword(date) {
  this.data = date || moment().toISOString();

  let month = moment(this.date).month() + 1;
  let year = moment(this.date).year();

  const transactionSelectQuery = `SELECT t.bank, b.bankNickName, SUM(t.credit - t.debit) AS totalAmount
  FROM ${transactionTabel} t
  LEFT JOIN ${bankTabel} b ON b.id = t.bank
  WHERE t.isDeleted = 0 AND MONTH(t.date) = ${month} AND YEAR(t.date) = ${year}
  GROUP BY t.bank, b.bankNickName;`;
  const [transactionData] = await db.promise().query(transactionSelectQuery);

  const findCarryQuery = `select * from bank_carry_forward where month=${month} AND year=${year}`;
  const [findCarryData] = await db.promise().query(findCarryQuery);

  console.log("\n\n\n\nfindCarryData=====>",findCarryData);

  const data = JSON.stringify(transactionData);
  if (!findCarryData.length) {
    const insertCarry = `INSERT INTO bank_carry_forward (month, year, data) VALUES ('${month}', '${year}', '${data}');`;
    await db.promise().query(insertCarry);
  } else {
    const data = JSON.stringify(transactionData);
    const insertCarry = `UPDATE bank_carry_forward SET data = '${data}' where id=${findCarryData[0].id};`;
    await db.promise().query(insertCarry);
  }
}

async function carryForwordGet(month, year) {
  let lastMonthDate = moment(
    `${year || moment().year()}/${month || moment().month() + 1}/01`
  ).date(0);

  this.month = lastMonthDate.month() + 1;
  this.year = lastMonthDate.year();

  const findCarryQuery = `select * from bank_carry_forward where month=${this.month} AND year=${this.year}`;
  const [findCarryData] = await db.promise().query(findCarryQuery);

  const bankData = findCarryData[0] ? findCarryData[0].data : [];

  return bankData;
}

module.exports = { bankCarryForword, carryForwordGet };
