const db = require("../../config/database");

const LabelCreate = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const [user] = await db
      .promise()
      .query(
        "INSERT INTO label_category (name,description,color) VALUES (?,?,?)",
        [name, description, color]
      );

    res.status(201).json({
      status: "ok",
      message: "label Inserted successfully",
      user: user,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

// const LabelUpdate = async (req, res) => {
//   try {
//     const labelId = req.query.id;
//     const [label] = await db
//       .promise()
//       .query("SELECT * FROM label_category WHERE id = ?", [labelId]);

//     if (!label || label.length === 0) {
//       throw new Error("label not found");
//     }
//     let { name, description, color } = req.body;

//     name = name ?? label[0].name;
//     description = description ?? label[0].description;
//     color = color ?? label[0].color;

//     const [updateuser] = await db
//       .promise()
//       .query(
//         "UPDATE label_category SET name = ? , description = ? , color = ? WHERE id = ?",
//         [name, description, color]
//       );

//     res.status(200).json({
//       status: "ok",
//       message: "updated successfully",
//       user: updateuser,
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: "not",
//       message: error.message,
//     });
//   }
// };

module.exports = {
  LabelCreate,
};
