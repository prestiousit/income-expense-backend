const db = require("../../config/database");

const BankCreate = async (req, res) => {
  try {
    let {
      bankname,
      banknickname,
      bankbranch,
      accountno,
      ifsc_code,
      amount,
      mobileno,
      user,
      description,
      status,
      label,
      color
    } = req.body;

    if(!status){
      status = "active";
    }

    const [bank] = await db
      .promise()
      .query(
        "INSERT INTO bank (bankName,bankNickName,bankBranch,accountNo,IFSC_code,amount,mobileNo,user,description,status,bankLabel,color,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,curdate())",
        [bankname,banknickname, bankbranch,accountno,ifsc_code,amount,mobileno,user,description,status,label,color]
      );

    res.status(201).json({
      status: "sucess",
      message: "bank Inserted successfully",
      bank: bank,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const BankUpdate = async (req, res) => {
  try {
    const bankId = req.query.id;
    const [bank] = await db
      .promise()
      .query("SELECT * FROM bank WHERE id = ?", [bankId]);

    if (!bank || bank.length === 0) {
      throw new Error("bank not found");
    }
    let { bankname,
      banknickname,
      bankbranch,
      accountno,
      ifsc_code,
      amount,
      mobileno,
      user,
      description,
      status,
      label,
      color } = req.body;

      bankname = bankname ?? bank[0].bankName;
      banknickname = banknickname ?? bank[0].bankNickName;
      bankbranch = bankbranch ?? bank[0].bankBranch;
      accountno = accountno ?? bank[0].accountNo;
      ifsc_code = ifsc_code ?? usbanker[0].IFSC_code;
      amount = amount ?? bank[0].amount;
      mobileno = mobileno ?? bank[0].mobileNo;
      user = user ?? bank[0].user;
      description = description ?? bank[0].description;
      status = status ?? bank[0].status;
      label = label ?? bank[0].bankLabel;
      color = color ?? bank[0].color;

    const [updatebank] = await db
      .promise()
      .query(
        "UPDATE bank SET bankName=? ,bankNickName=? ,bankBranch=? ,accountNo=? ,IFSC_code=? ,amount=? ,mobileNo=? ,user=? ,description=? ,status=? ,bankLabel=? ,color=?, updatedAt=curdate()  WHERE id = ?",
        [bankname,banknickname, bankbranch,accountno,ifsc_code,amount,mobileno,user,description,status,label,color,bankId]
      );

    res.status(200).json({
      status: "success",
      message: "bank updated successfully",
      user: updatebank,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const BankGet = async (req, res) => {
  try {
    const [bank] = await db.promise().query("SELECT * FROM bank WHERE isDeleted = 0 AND status = 'active'");

    if (!bank || bank.length === 0) {
      throw new Error("no data found");
    }

    res.status(200).json({
      status: "success",
      message: "get all data of bank",
      bank: bank,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};
                                                    
const BankDelete = async (req, res) => {
  try {
    const bankId = req.query.id;
    const [bank] = await db
      .promise()
      .query("SELECT * FROM bank WHERE id = ?", [bankId]);

    if (!bank || bank.length === 0) {
      throw new Error("bank not found");
    }

    const [deletebank] = await db
      .promise()
      .query(
        "UPDATE bank SET isDeleted = 1, deletedAt=curdate() WHERE id = ?",
        [bankId]
      );

    res.status(200).json({
      status: "success",
      message: "bank Deleted successfully",
      bank: deletebank,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const BankAddByFrontEnd = async (req, res) => {
  try {
    const {banknickname,amount,user} = req.body;

    console.log(banknickname,amount,user);
    const [bankId] = await db
      .promise()
      .query("SELECT id FROM bank WHERE bankNickName=?", [banknickname]);

    let bankInsert, msg;
    if (!bankId || bankId.length === 0) {
      [bankInsert] = await db
        .promise()
        .query(
          "INSERT INTO bank (bankNickName,amount,user,createdAt) VALUES (?,?,?,curdate())",
          [banknickname,amount,user]
        );
      msg = "bank Inserted";
    }

    res.status(200).json({
      status: "success",
      message: msg || "bankId found",
      bank: bankInsert || bankId[0].id,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};


module.exports = {
  BankCreate,
    BankUpdate,
    BankGet,
    BankDelete,
    BankAddByFrontEnd
};
