const cron = require("node-cron");
const db = require("./config/database");
const moment = require("moment");

async function cronJobScheduler() {
  let month = moment(moment().toISOString()).month() + 1;
  let year = moment(moment().toISOString()).year();

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

  
  if (lastMonthData[0]) {
    let dataForward = JSON.stringify(lastMonthData[0].data)
    const insertCarry = `INSERT INTO bank_carry_forward (month, year, data) VALUES ('${month}', '${year}', '${dataForward}');`;
    await db.promise().query(insertCarry);
  }
}

module.exports = cronJobScheduler;
