import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
};

// Read All
export const getAllUser = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: userSelect,
      orderBy: { id: "asc" },
    });

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
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid user ID",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "User found",
      data: user,
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
  const { name, email, password, role, status, is_active } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "Name, email, and password are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const resolvedStatus =
      status !== undefined
        ? status
        : is_active !== undefined
          ? Boolean(is_active)
            ? "ACTIVE"
            : "INACTIVE"
          : "ACTIVE";

    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: role ?? "ADMIN",
        status: resolvedStatus,
      },
      select: userSelect,
    });

    return res.status(201).json({
      status: true,
      message: "Create user success",
      data: createdUser,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        status: false,
        message: "Email already registered",
      });
    }

    return res.status(500).json({
      status: false,
      message: "Create user failed",
      error: error.message,
    });
  }
};

// Update
export const updateUser = async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, password, role, status, is_active } = req.body;

  try {
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid user ID",
      });
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    if (!existing) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const resolvedStatus =
      status !== undefined
        ? status
        : is_active !== undefined
          ? Boolean(is_active)
            ? "ACTIVE"
            : "INACTIVE"
          : existing.status;

    const updateData = {
      name: name !== undefined ? name : existing.name,
      email: email !== undefined ? email : existing.email,
      role: role !== undefined ? role : existing.role,
      status: resolvedStatus,
    };

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });

    return res.status(200).json({
      status: true,
      message: "Update user success",
      data: updatedUser,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        status: false,
        message: "Email already in use",
      });
    }

    return res.status(500).json({
      status: false,
      message: "Update user failed",
      error: error.message,
    });
  }
};

// Delete
export const deleteUser = async (req, res) => {
  const id = Number(req.params.id);

  try {
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid user ID",
      });
    }

    const deletedUser = await prisma.user.delete({
      where: { id },
      select: userSelect,
    });

    return res.status(200).json({
      status: true,
      message: "Delete user success",
      data: deletedUser,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    return res.status(500).json({
      status: false,
      message: "Delete user failed",
      error: error.message,
    });
  }
};