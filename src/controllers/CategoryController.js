import { prisma } from "../lib/prisma.js";

// read all
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: "desc" },
    });

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

// read by id
export const getCategoryById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid category id",
      });
    }

    const category = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Categories not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Categories found",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Fetch categories failed",
      error: error.message,
    });
  }
};

// create
export const createCategory = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({
        status: false,
        message: "Category name is required",
      });
    }

    const category = await prisma.category.create({
      data: { name: name.trim() },
    });

    return res.status(201).json({
      status: true,
      message: "Create categories success",
      data: category,
    });
  } catch (error) {
    if (error.code === "P2002") {
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

// update
export const updateCategory = async (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;

  try {
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid category id",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        status: false,
        message: "Category name is required",
      });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name: name.trim() },
    });

    return res.status(200).json({
      status: true,
      message: "Update categories success",
      data: category,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        status: false,
        message: "Categories not found",
      });
    }

    if (error.code === "P2002") {
      return res.status(400).json({
        status: false,
        message: "Categories name is already exist",
      });
    }

    return res.status(500).json({
      status: false,
      message: "Update categories failed",
      error: error.message,
    });
  }
};

// delete
export const deleteCategory = async (req, res) => {
  const id = Number(req.params.id);

  try {
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid category id",
      });
    }

    const deleted = await prisma.category.delete({
      where: { id },
    });

    return res.status(200).json({
      status: true,
      message: "Delete categories success",
      data: deleted,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        status: false,
        message: "Categories not found",
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        status: false,
        message: "Category is still used by products",
      });
    }

    return res.status(500).json({
      status: false,
      message: "Delete categories failed",
      error: error.message,
    });
  }
};