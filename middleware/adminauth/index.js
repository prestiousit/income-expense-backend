const jwt = require("jsonwebtoken");
const db = require("../../config/database");

async function AdminAuth(req, res, next) {
  try {
    const token = req.headers.token;
    if (!token) throw new Error("send token first..!");

    const Checktoken = jwt.verify(token,process.env.SECRET_KEY)


    if(!Checktoken) throw new Error("Token is Not Vailid..!");

    const [UserCheck] = await db.promise().query(`SELECT * FROM adminUser WHERE id = ${Checktoken.id}`)

    if(!UserCheck) throw new Error("Admin User is Not Found..!");

    next();
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
}

module.exports = {
  AdminAuth,
};
