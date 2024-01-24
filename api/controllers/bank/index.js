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

    const sql = `INSERT INTO banktable
      (bankName, bankNickName, bankBranch, accountNo, IFSC_code, amount, mobileNo, user, description, status, bankLabel, color,isDeleted,createdBy,createdAt)
       VALUES (${placeholders})`;

    const [bank] = await db.promise().query(sql, values);

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

    const updateFields = Object.keys(req.body)
      .map((key) => `${key} = '${req.body[key]}'`)
      .join(", ");

    const Quary = `UPDATE banktable SET ${updateFields} WHERE id = ${bankId}`;

    const [updateuser] = await db.promise().query(Quary);

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
    const sql = `
      SELECT b.id,bankName,bankNickName,amount,bankBranch,accountNo,IFSC_code,b.mobileNo,u.name as username,b.description,l.name as bankLabel,b.status,b.color
      FROM bank b
      LEFT JOIN user u ON b.user = u.id
      LEFT JOIN label_category l ON b.bankLabel = l.id
      WHERE b.isDeleted = 0`;

    const [Data] = await db.promise().query(sql);

    console.log(Data);
    res.status(200).json({
      status: "success",
      message: "get all data of bank",
      data: Data,
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
      .query("SELECT * FROM banktable WHERE id = ?", [bankId]);

    if (!bank || bank.length === 0) {
      throw new Error("bank not found");
    }

    const [deletebank] = await db
      .promise()
      .query("UPDATE banktable SET isDeleted = 1 WHERE id = ?", [bankId]);

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

module.exports = {
  BankCreate,
  BankUpdate,
  BankGet,
  BankDelete,
};
