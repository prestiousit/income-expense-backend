/// include all logics or methods
const jwt = require("jsonwebtoken");
const moment = require("moment");
async function jwtTokenVerify(token) {
  const tokenCheck = jwt.verify(token, process.env.SECRET_KEY);

  return tokenCheck;
}
async function hasMonthChanged() {
  const today = moment("01/01/2024");
  const currentYear = today.year();
  let lastMonth = today.month() + 1 - 1;
  const currentMonth = today.month() + 1;

  if(today.day() !== 1){
    return {result : false}
  }

  let lastMonthCheck = lastMonth + 1; // lastmonth + 1 current month

  if (lastMonthCheck == 13) {
    lastMonthCheck = 1;
  }
  if (lastMonthCheck == 0) {
    lastMonthCheck = 1;
  }
  let lastYear = currentYear;
  if (lastMonth == 0) {
    lastMonth = 12;
    lastYear = currentYear - 1;
  }

  let result = lastMonthCheck === currentMonth;

  return { result, lastMonth, currentMonth, lastYear };
}

module.exports = {
  jwtTokenVerify,
  hasMonthChanged,
};
