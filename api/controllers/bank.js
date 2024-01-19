// const db = require("../../config/database");

// const BankCreate = async (req, res) => {
//   try {
//     let {
//       bankname,
//       banknickname,
//       bankbranch,
//       accountno,
//       ifsc_code,
//       amount,
//       mobileno,
//       user,
//       description,
//       status,
//       label,
//       color
//     } = req.body;

//     if(!status){
//       status = "active";
//     }

//     const [bank] = await db
//       .promise()
//       .query(
//         "INSERT INTO bank (bankName,bankNickName,bankBranch,accountNo,IFSC_code,amount,mobileNo,user,description,status,bankLabel,color) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
//         [bankname,banknickname, bankbranch,accountno,ifsc_code,amount,mobileno,user,description,status,label,color]
//       );

//     res.status(201).json({
//       status: "sucess",
//       message: "bank Inserted successfully",
//       bank: bank,
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: "failed",
//       message: error.message,
//     });
//   }
// };

// module.exports = {
//   BankCreate,
//   //   BankUpdate,
//   //   BankGet,
//   //   BankDelete
// };
