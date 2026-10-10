import pool from "../config/db.js";

const USERS = [
  {
    id: 1,
    name: "Angga",
    email: "Admin@gmail.com",
    password: "12345678",
  },
  {
    id: 2,
    name: "Dayat",
    email: "dayat@gmail.com",
    password: "12345678",
  },
  {
    id: 3,
    name: "Ujang",
    email: "ujang@gmail.com",
    password: "12345678",
  },
];

//CRUD (creat, read, update, delete)

// Read
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

export const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [user] = await pool.query(
      "SELECT id, name, email, is_active FROM users WHERE id= ?",
      [id],
    );
    if (user.length === 0) {
      res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      status: true,
      message: "User found",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Fetch user failed",
      error: error.message,
    });
  }
};

// Create
export const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const [user] = await pool.query(
      "INSERT INTO users(name,email,password) VALUES (?,?,?)",
      [name, email, password],
    );
    return res.status(200).json({
      status: true,
      message: "Fetch user success",
      data: { id: user.insertId, name, email },
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
  const { name, email, password } = req.body;
  try {
    const [user] = await pool.query(
      "UPDATE users SET name=?, email=?, password=? WHERE id=?",
      [name, email, password, id],
    );
    return res.status(200).json({
      status: true,
      message: "Update user success",
      data: user,
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
    const [result] = await pool.query("DELETE FROM users WHERE id=? ", [id]);

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

  // const deletedUser = USERS.splice(userIndex, 1)[0];
  // return res.status(200).json({
  //   status: true,
  //   message: "Delete user success",
  // });
};
