import pool from "../config/db.js";

// read
export const getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      "SELECT * FROM categories ORDER BY id DESC",
    );
    return res.status(200).json({
      status: true,
      message: "Fetch categories success",
      total: categories.length,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Fetch categories failed",
      error: error.message,
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [categories] = await pool.query(
      "SELECT id, nama FROM categories WHERE id= ?",
      [id],
    );
    if (categories.length === 0) {
      res.status(404).json({
        status: false,
        message: "Categories not found",
      });
    }
    res.status(200).json({
      status: true,
      message: "Categories found",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Fetch categoires failed",
      error: error.message,
    });
  }
};

// create
export const createCategory = async (req, res) => {
  const { nama } = req.body;

  try {
    const [categories] = await pool.query(
      "INSERT INTO categories(nama) VALUES (?)",
      [nama],
    );
    return res.status(200).json({
      status: true,
      message: "Fetch categories success",
      data: { id: categories.insertId, nama },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        status: false,
        message: "Categories name is already exist",
      });
    }
    return res.status(500).json({
      status: false,
      message: "Create categories failed",
      error: error.message,
    });
  }
};

// Update
export const updateCategory = async (req, res) => {
  const id = parseInt(req.params.id);
  const { nama } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE categories SET nama=? WHERE id=?",
      [nama, id],
    );
    return res.status(200).json({
      status: true,
      message: "Update categories success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Update categories failed",
      error: error.message,
    });
  }
};

// Delete
export const deleteCategory = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [result] = await pool.query("DELETE FROM categories WHERE id=? ", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: "Categories not found",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Delete categories success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Delete categories failed",
      error: error.message,
    });
  }
};
