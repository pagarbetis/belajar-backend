import pool from "../config/db.js";

// Read All
export const getAllUser = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, is_active FROM users",
    );
    return res.status(200).json({
      status: true,
      message: "Fetch user success",
      total: rows.length,
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Fetch user failed",
      error: error.message,
    });
  }
};

// Read by ID
export const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [user] = await pool.query(
      "SELECT id, name, email, is_active FROM users WHERE id = ?",
      [id],
    );

    if (user.length === 0) {
      // FIX: Tambahin return biar eksekusi berhenti di sini
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "User found",
      data: user[0], // Ambil index ke-0 aja biar langsung objek, bukan array
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Fetch user failed",
      error: error.message,
    });
  }
};

// Create
export const createUser = async (req, res) => {
  const { name, email, password, is_active } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, is_active) VALUES (?, ?, ?, ?)",
      [name, email, password, is_active !== undefined ? is_active : 1],
    );

    return res.status(201).json({
      // Status 201 Created lebih standar buat POST
      status: true,
      message: "Create user success", // FIX: Sebelumnya tulisannya "Fetch"
      data: { id: result.insertId, name, email, is_active: is_active ?? 1 },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Create user failed",
      error: error.message,
    });
  }
};

// Update
export const updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, password, is_active } = req.body;

  try {
    // Cek dulu user-nya ada apa nggak
    const [existing] = await pool.query("SELECT * FROM users WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (!password) {
      await pool.query(
        "UPDATE users SET name = ?, email = ?, is_active = ? WHERE id = ?",
        [name, email, is_active, id],
      );
    } else {
      await pool.query(
        "UPDATE users SET name = ?, email = ?,password= ?, is_active = ? WHERE id = ?",
        [name, email, password, is_active, id],
      );
    }

    return res.status(200).json({
      status: true,
      message: "Update user success",
      data: { id, name, email, is_active },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Update user failed",
      error: error.message,
    });
  }
};

// Delete
export const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Delete user success",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Delete user failed",
      error: error.message,
    });
  }
};
