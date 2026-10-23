import pool from "../config/db.js";
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
// import { route } from "express/lib/application.js";

// Read All
export const getAllUser = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        update_at: true,
      },
    });

    // const [rows] = await pool.query(
    //   "SELECT id, name, email, is_active FROM users",
    // );
    return res.status(200).json({
      status: true,
      message: "Fetch user success",
      total: users.length,
      data: users,
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

    const users = await prisma.user.findUnique({
      where: { id: id },
    });

    return res.status(200).json({
      status: true,
      message: "User found",
      data: users,
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
    const users = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return res.status(201).json({
      status: true,
      message: "Create user success",
      data: { id: users.insertId, name, email, is_active: is_active ?? 1 },
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
  try {
    const id = parseInt(req.params.id);
    const { name, email, password, is_active } = req.body;

    const dataUpdate = {};
    if (email) dataUpdate.email = email;
    if (name) dataUpdate.name = name;
    if (password) {
      dataUpdate.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: id },
      data:  dataUpdate ,
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        update_at: true,
      },
    });

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
    await prisma.user.delete({
      where: {
        id: id,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Delete user success",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Delete user failed",
      error: error.message,
    });
  }
};
