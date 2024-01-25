/// include all logics or methods
const jwt = require("jsonwebtoken");
async function jwtTokenVerify(token) {
  const tokenCheck = jwt.verify(token, process.env.SECRET_KEY);

  return tokenCheck;
}

module.exports = {
    jwtTokenVerify
}
