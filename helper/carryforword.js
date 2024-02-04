const moment = require("moment");
const db = require("../config/database");
const { transactionTabel, bankTabel } = require("../database/tabelName");

async function bankCarryForword(date) {

  let month = moment(date || moment().toISOString()).month() + 1;
  let year = moment(date || moment().toISOString()).year();

  const transactionSelectQuery = `SELECT t.bank , coalesce(SUM(credit),0) as credit,coalesce(SUM(debit),0) as debit
    FROM ${transactionTabel} t
    LEFT JOIN ${bankTabel} b ON b.id = t.bank
    WHERE t.isDeleted = 0 AND MONTH(t.date) <= ${month} AND YEAR(t.date) <= ${year}
    GROUP BY t.bank, b.bankNickName;`;

  let [transactionData] = await db.promise().query(transactionSelectQuery);


  const findCarryQuery = `select * from bank_carry_forward where month=${month} AND year=${year}`;
  const [findCarryData] = await db.promise().query(findCarryQuery);

  // const findBankFromCarry = `select * from bank_carry where month=${month - 1} AND year=${year - 1}`
  // const [findBankFromCarryData] = await db.promise().query(findBankFromCarry);

  const opdata = transactionData.map((el) => {
    let opbank = {
      "credit": el.credit || 0,
      "debit": el.debit || 0
    };

    let op = {};
    op[el.bank] = opbank;

    return op;
  });


  const data = JSON.stringify(opdata);
  console.log("\n\n\n\n\ntransactionData==========>", data);

  if (!findCarryData.length) {
    const insertCarry = `INSERT INTO bank_carry_forward (month, year, data) VALUES ('${month}', '${year}', '${data}');`;
    await db.promise().query(insertCarry);
  } else {
    const updateCarry = `UPDATE bank_carry_forward SET data = '${data}' where id=${findCarryData[0].id};`;
    await db.promise().query(updateCarry);

    const getMonthsSql = `select * from bank_carry_forward where month > ${month}`;
    const [getMonthsData] = await db.promise().query(getMonthsSql);

    console.log("\n\n\n\ngetMonthsData=======", getMonthsData);
    for (let i = 0; i < getMonthsData.length; i++) {

      const transactionSelectQuery = `SELECT t.bank , coalesce(SUM(credit),0) as credit,coalesce(SUM(debit),0) as debit
        FROM ${transactionTabel} t
        LEFT JOIN ${bankTabel} b ON b.id = t.bank
        WHERE t.isDeleted = 0 AND MONTH(t.date) <= ${getMonthsData[i].month} AND YEAR(t.date) <= ${getMonthsData[i].year}
        GROUP BY t.bank, b.bankNickName;`;

      let [transactionData] = await db.promise().query(transactionSelectQuery);

      const opdata = transactionData.map((el) => {
        let opbank = {
          "credit": el.credit || 0,
          "debit": el.debit || 0
        };

        let op = {};
        op[el.bank] = opbank;

        return op;
      });

      const data = JSON.stringify(opdata);

      console.log("\n\n\n updated Data-----------", data);

      const updateCarry = `UPDATE bank_carry_forward SET data = '${data}' where id=${getMonthsData[i].id};`;
      await db.promise().query(updateCarry);
    }
  }
}

async function carryForwordGet(month, year) {

  // let month = moment(date || moment().toISOString()).month() + 1;
  // let year = moment(date || moment().toISOString()).year();
  // let lastMonthDate = moment(
  //   `${year || moment().year()}/${month || moment().month() + 1}/01`
  // ).date(0);

  // this.month = lastMonthDate.month() + 1;
  // this.year = lastMonthDate.year();

  // console.log("\n\n\n\nthis.month========>", this.month, this.year);

  const findCarryQuery = `select * from bank_carry_forward where month<=${month} AND year=${year} order by id desc limit 1`;
  const [findCarryData] = await db.promise().query(findCarryQuery);

  const bankData = findCarryData ? findCarryData : [];

  console.log("\n\n\nbankData========", bankData);
  return bankData;
}

module.exports = { bankCarryForword, carryForwordGet };
