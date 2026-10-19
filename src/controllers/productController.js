import pool from "../config/db.js";

// read
export const getAllProduct = async (req, res) => {
  try {
    const [product] = await pool.query(
      "SELECT product.*, categories.name AS category_name FROM product LEFT JOIN categories ON product.category_id = categories.id",
    );
    return res.status(200).json({
      status: true,
      message: "Fetch product success",
      total: product.length,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Fetch product failed",
      error: error.message,
    });
  }
};

// get one product
export const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [product] = await pool.query(
      "SELECT id, nama, category_id, price,stock, description FROM product WHERE id= ?",
      [id],
    );
    if (product.length === 0) {
      res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      status: true,
      message: "Product found",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Fetch product failed",
      error: error.message,
    });
  }
};

// create
export const createProduct = async (req, res) => {
  const { category_id, nama, price, description, is_active } = req.body;

  try {
    const [product] = await pool.query(
      "INSERT INTO product(category_id, nama, price, description, is_active) VALUES (?, ?, ?, ?, ?)",
      [category_id, nama, price, description, is_active],
    );
    return res.status(200).json({
      status: true,
      message: "Fetch product success",
      data: { id: product.insertId, nama },
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
      message: "Create product failed",
      error: error.message,
    });
  }
};

// Update
export const updateProduct = async (req, res) => {
  const id = parseInt(req.params.id);
  const { nama, price,stock, description, is_active } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE product SET nama=?, price=?,stock=?, description=?, is_active=? WHERE id=?",
      [nama, price,stock, description, is_active, id],
    );
    return res.status(200).json({
      status: true,
      message: "Update product success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Update product failed",
      error: error.message,
    });
  }
};

// Delete
export const deleteProduct = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [result] = await pool.query("DELETE FROM product WHERE id=? ", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Delete product success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Delete product failed",
      error: error.message,
    });
  }
};
