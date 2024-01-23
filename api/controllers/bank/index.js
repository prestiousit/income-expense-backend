const db = require("../../../config/database");

const BankCreate = async (req, res) => {
  try {
    let {
      bankname,
      banknickname,
      bankbranch,
      accountno,
      ifsc_code,
      amount,
      mobileNo,
      user,
      description,
      status,
      label,
      color,
    } = req.body;

    if (!user) {
      throw new Error("User is Required..!");
    } else if (!banknickname) {
      throw new Error("Bank Nick Name is Required..!");
    } else if (!amount) {
      throw new Error("Amount is Required..!");
    }

    if (!status) {
      status = "active";
    }

    let values = [
      bankname,
      banknickname,
      bankbranch,
      accountno,
      ifsc_code,
      amount,
      mobileNo,
      user,
      description,
      status,
      label,
      color,
      (isDeleted = 0),
      (createdBy = "1"), // store user id now i set defualt value
      (createdAt = new Date()),
    ];

    const placeholders = values.map((values) => `'${values}'`).join(",");

    console.log(placeholders);

    const sql = `INSERT INTO bank
      (bankName, bankNickName, bankBranch, accountNo, IFSC_code, amount, mobileNo, user, description, status, bankLabel, color,isDeleted,createdBy,createdAt)
       VALUES (${placeholders})`;

    const [bank] = await db.promise().query(sql, values);

    console.log("Quary=====>", sql);

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
      color,
    } = req.body;

    bankname = bankname ?? bank[0].bankName;
    banknickname = banknickname ?? bank[0].bankNickName;
    bankbranch = bankbranch ?? bank[0].bankBranch;
    accountno = accountno ?? bank[0].accountNo;
    ifsc_code = ifsc_code ?? usbanker[0].IFSC_code;
    amount = amount ?? bank[0].amount;
    mobileno = mobileno ?? bank[0].mobileNo;
    user = user ?? user[0].user;
    description = description ?? bank[0].description;
    status = status ?? bank[0].status;
    label = label ?? bank[0].bankLabel;
    color = color ?? bank[0].color;

    const [updateuser] = await db
      .promise()
      .query(
        "UPDATE bank SET bankName=? ,bankNickName=? ,bankBranch=? ,accountNo=? ,IFSC_code=? ,amount=? ,mobileNo=? ,user=? ,description=? ,status=? ,bankLabel=? ,color=?  WHERE id = ?",
        [
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
          color,
          bankId,
        ]
      );

    res.status(200).json({
      status: "success",
      message: "bank updated successfully",
      user: updateuser,
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
    const filed = [
      "id",
      "bankName",
      "bankNickName",
      "bankBranch",
      "accountNo",
      "IFSC_code",
      "mobileNo",
      "description",
    ];
    const sql = `SELECT ${filed.toString()} FROM bank WHERE isDeleted = 0 AND status = 'active'`;

    const [data] = await db.promise().query(sql);

    if (!data || data.length === 0) {
      throw new Error("no data found");
    }

    // const Data =
    //  await data.map((value)=>{

    //     return value
    //   })

    res.status(200).json({
      status: "success",
      message: "get all data of bank",
      data,
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
      .query("UPDATE bank SET isDeleted = 1 WHERE id = ?", [bankId]);

    res.status(200).json({
      status: "success",
      message: "bank Deleted successfully",
      label: deletebank,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const BankGetDropDown = async (req, res) => {
  try {
    const filed = [
      "id",
      "bankNickName",
    ];
    const sql = `SELECT ${filed.toString()} FROM bank WHERE isDeleted = 0 AND status = 'active'`;

    const [data] = await db.promise().query(sql);

    if (!data || data.length === 0) {
      throw new Error("no data found");
    }

    const Data = await data.map((value)=>{
      return{
        value : value.id,
        label : value.bankNickName
      }
    }) 

    console.log(Data);
    res.status(200).json({
      status: "success",
      message: "get all data of bank",
      data,
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
  BankGetDropDown
};
