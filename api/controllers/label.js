const db = require("../../config/database");

const LabelCreate = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const [label] = await db
      .promise()
      .query(
        "INSERT INTO label_category (name,description,color) VALUES (?,?,?)",
        [name, description, color]
      );

    res.status(201).json({
      status: "success",
      message: "label Inserted successfully",
      label: label,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const LabelUpdate = async (req, res) => {
  try {
    const labelId = req.query.id;
    const [label] = await db
      .promise()
      .query("SELECT * FROM label_category WHERE id = ?", [labelId]);

    if (!label || label.length === 0) {
      throw new Error("label not found");
    }
    let { name, description, color } = req.body;

    name = name ?? label[0].name;
    description = description ?? label[0].description;
    color = color ?? label[0].color;

    console.log(name, description, color);

    const [updatelabel] = await db
      .promise()
      .query(
        "UPDATE label_category SET name = ? , description = ? , color = ? WHERE id = ?",
        [name, description, color, labelId]
      );

    res.status(200).json({
      status: "success",
      message: "updated successfully",
      label: updatelabel,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const LabelGet = async (req, res) => {
  try {
    const [label] = await db.promise().query("SELECT * FROM label_category WHERE isDeleted = 0");

    if (!label || label.length === 0) {
      throw new Error("no found");
    }

    res.status(200).json({
      status: "success",
      message: "get all data",
      label: label,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

const LabelDelete = async (req, res) => {
  try {
    const labelId = req.query.id;
    const [label] = await db
      .promise()
      .query("SELECT * FROM label_category WHERE id = ?", [labelId]);

    if (!label || label.length === 0) {
      throw new Error("label not found");
    }

    const [deletelabel] = await db
      .promise()
      .query(
        "UPDATE label_category SET isDeleted = 1 WHERE id = ?",
        [labelId]
      );

    res.status(200).json({
      status: "success",
      message: "Deleted successfully",
      label: deletelabel,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
};

module.exports = {
  LabelCreate,
  LabelUpdate,
  LabelGet,
  LabelDelete
};
