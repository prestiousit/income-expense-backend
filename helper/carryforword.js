const moment = require("moment");
const db = require("../config/database");
const { transactionTabel, bankTabel } = require("../database/tabelName");

async function bankCarryForword(date) {

  let month = moment(date || moment().toISOString()).month() + 1;
  let year =  moment(date || moment().toISOString()).year();

  const transactionSelectQuery = `SELECT t.bank,SUM(t.credit - t.debit) AS amount
  FROM ${transactionTabel} t
  LEFT JOIN ${bankTabel} b ON b.id = t.bank
  WHERE t.isDeleted = 0 AND MONTH(t.date) <= ${month} AND YEAR(t.date) <= ${year}
  GROUP BY t.bank, b.bankNickName;`;

  let [transactionData] = await db.promise().query(transactionSelectQuery);

  const findCarryQuery = `select * from bank_carry_forward where month=${month} AND year=${year}`;
  const [findCarryData] = await db.promise().query(findCarryQuery);

  transactionData = transactionData.map((el)=>`${el.bank}:${el.amount}`);
  const data = JSON.stringify(transactionData);

  if (!findCarryData.length) {
    const insertCarry = `INSERT INTO bank_carry_forward (month, year, data) VALUES ('${month}', '${year}', '${data}');`;
    await db.promise().query(insertCarry);
  } else {
    const updateCarry  = `UPDATE bank_carry_forward SET data = '${data}' where id=${findCarryData[0].id};`;
    await db.promise().query(updateCarry );

    const getMonthsSql = `select * from bank_carry_forward where month > ${month}`;
    const [getMonthsData] = await db.promise().query(getMonthsSql);

    console.log("\n\n\n\ngetMonthsData=======",getMonthsData);
    for(let i=0 ; i<getMonthsData.length ; i++){
      const transactionSelectQuery = `SELECT t.bank,SUM(t.credit - t.debit) AS amount
      FROM ${transactionTabel} t
      LEFT JOIN ${bankTabel} b ON b.id = t.bank
      WHERE t.isDeleted = 0 AND MONTH(t.date) <= ${getMonthsData[i].month} AND YEAR(t.date) <= ${getMonthsData[i].year}
      GROUP BY t.bank, b.bankNickName;`;

      let [transactionData] = await db.promise().query(transactionSelectQuery);

      transactionData = transactionData.map((el)=>`${el.bank}:${el.amount}`);
      const data = JSON.stringify(transactionData);

      const updateCarry  = `UPDATE bank_carry_forward SET data = '${data}' where id=${getMonthsData[i].id};`;
      await db.promise().query(updateCarry );
    }
  }
}

async function carryForwordGet(month, year) {
  let lastMonthDate = moment(
    `${year || moment().year()}/${month || moment().month() + 1}/01`
  ).date(0);

  this.month = lastMonthDate.month() + 1;
  this.year = lastMonthDate.year();

  console.log("\n\n\n\nthis.month========>",this.month,this.year);

  const findCarryQuery = `select * from bank_carry_forward where month<=${this.month} AND year=${this.year} order by id desc limit 1`;
  const [findCarryData] = await db.promise().query(findCarryQuery);

  const bankData = findCarryData[0] ? findCarryData[0].data : [];

  console.log("\n\n\nbankData========",bankData);
  return bankData;
}

module.exports = { bankCarryForword, carryForwordGet };
