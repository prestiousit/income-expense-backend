const moment = require("moment");
const db = require("../config/database");
const { transactionTabel, bankTabel } = require("../database/tabelName");

async function bankCarryForword(date, transcationId,type) {
  let month = moment(date || moment().toISOString()).month() + 1;
  let year = moment(date || moment().toISOString()).year();

  const transactionSelectQuery = `select date,bank,credit,debit from ${transactionTabel} where id = ${transcationId}`;
  let [transactionData] = await db.promise().query(transactionSelectQuery);

  const curretMonth = `select * from bank_carry_forward where month=${month} AND year=${year}`;
  const [curretMonthData] = await db.promise().query(curretMonth);

  let queryMonth = month;
  let queryYear = year;
  if (queryMonth === 1) {
    queryMonth = 12;
    queryYear -= 1;
  } else {
    queryMonth -= 1;
  }
  const lastMonth = `select data from bank_carry_forward where month = ${queryMonth} and year = ${queryYear}`;
  const [lastMonthData] = await db.promise().query(lastMonth);

  let { bank, credit, debit } = transactionData[0];
  if (!curretMonthData.length) {
    if (!lastMonthData.length) {
      const data = [];
      const Insert = {
        bank: +bank,
        credit: +credit,
        debit: +debit,
        total: +credit - +debit,
      };
      data.push(Insert);
      const newData = JSON.stringify(data);

      const insertCarry = `INSERT INTO bank_carry_forward (month, year, data) VALUES ('${month}', '${year}', '${newData}');`;
      await db.promise().query(insertCarry);
    } else {
      const selectBank = lastMonthData[0].data.find((el) => el.bank === bank);
      if (selectBank) {
        const selectDataIndex = lastMonthData[0].data.indexOf(selectBank);
        lastMonthData[0].data.splice(selectDataIndex, 1);
        const selectDataRemove = lastMonthData[0].data;

        const Insert = {
          bank: +bank,
          credit: +selectBank.credit + +credit,
          debit: +selectBank.debit + +debit,
          total: +selectBank.total + (+credit - +debit),
        };
        selectDataRemove.push(Insert);
        const newData = JSON.stringify(selectDataRemove);

        const insertCarry = `INSERT INTO bank_carry_forward (month, year, data) VALUES ('${month}', '${year}', '${newData}');`;
        await db.promise().query(insertCarry);
      } else {
        let data = [...lastMonthData[0].data];
        const Insert = {
          bank: +bank,
          credit: +credit,
          debit: +debit,
          total: +credit - +debit,
        };
        data.push(Insert);
        const newData = JSON.stringify(data);

        const insertCarry = `INSERT INTO bank_carry_forward (month, year, data) VALUES ('${month}', '${year}', '${newData}');`;
        await db.promise().query(insertCarry);
      }
    }
  } else {
    const selectBank = curretMonthData[0].data.find((el) => el.bank === bank);
    let newData;
    if (selectBank) {
      const selectDataIndex = curretMonthData[0].data.indexOf(selectBank);
      curretMonthData[0].data.splice(selectDataIndex, 1);
      const selectDataRemove = curretMonthData[0].data;

      let data = [...selectDataRemove];

      if(type == 'delete'){
        credit = -+credit;
        debit = -+debit;
      }

      console.log("\n\ncredit====",credit,debit);
      const Insert = {
        bank: +bank,
        credit: +selectBank.credit + +credit,
        debit: +selectBank.debit + +debit,
        total: +selectBank.total + (+credit - +debit),
      };

      data.push(Insert);
      newData = JSON.stringify(data);

      monthFrowerd(date, +credit, +debit, curretMonthData[0].id);
    } else {
      let data = [...curretMonthData[0].data];

      const Insert = {
        bank: +bank,
        credit: +credit,
        debit: +debit,
        total: +credit - +debit,
      };

      data.push(Insert);
      newData = JSON.stringify(data);
    }
    const updateQuery = `UPDATE bank_carry_forward SET data = '${newData}' where id=${curretMonthData[0].id};`;
    await db.promise().query(updateQuery);
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

async function monthFrowerd(date, credit, debit, bankId) {
  let month = moment(date || moment().toISOString()).month() + 1;
  let year = moment(date || moment().toISOString()).year();

  const getMonthsSql = `select * from bank_carry_forward WHERE (year > ${year}) OR (year = ${year} AND month > ${month})`;
  const [getMonthsData] = await db.promise().query(getMonthsSql);

  for (let i = 0; i < getMonthsData.length; i++) {
    let data = getMonthsData[i].data;
    let id = getMonthsData[i].id;

    let findBank = data.find((el) => el.bank === bankId);

    console.log("\n\nfindbank===",findBank);
    let selectDataIndex = data.indexOf(findBank);
    data.splice(selectDataIndex, 1);

    let newData = [...data];

    if (findBank) {
      const Insert = {
        bank: +bankId,
        credit: credit + +findBank.credit,
        debit: +findBank.debit,
        total: +findBank.total + (+credit - +debit),
      };

      newData.push(Insert);
    }

    console.log("\n\newData===",newData);   

    let newDataStringify = JSON.stringify(newData);

    const updateQuery = `UPDATE bank_carry_forward SET data = '${newDataStringify}' where id=${id};`;
    await db.promise().query(updateQuery);
  }
}

module.exports = { bankCarryForword, carryForwordGet };
