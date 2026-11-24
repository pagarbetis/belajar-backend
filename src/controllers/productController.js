import { prisma } from "../lib/prisma.js";

// read all
export const getAllProduct = async (req, res) => {
  try {
    const rows = await prisma.product.findMany({
      orderBy: { id: "desc" },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const products = rows.map(({ category, ...rest }) => ({
      ...rest,
      category_name: category?.name ?? null,
    }));

    return res.status(200).json({
      status: true,
      message: "Fetch product success",
      total: products.length,
      data: products,
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
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid product id",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        nama: true,
        category_id: true,
        price: true,
        stock: true,
        description: true,
        is_active: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Product found",
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

// create
export const createProduct = async (req, res) => {
  const { category_id, nama, price, stock, description, is_active } = req.body;

  try {
    const parsedCategoryId = Number(category_id);
    const parsedPrice = Number(price);
    const parsedStock = stock !== undefined ? Number(stock) : 0;

    if (!nama || !String(nama).trim()) {
      return res.status(400).json({
        status: false,
        message: "Product nama is required",
      });
    }

    if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
      return res.status(400).json({
        status: false,
        message: "Valid category_id is required",
      });
    }

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        status: false,
        message: "Valid price is required",
      });
    }

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        status: false,
        message: "Stock must be a non-negative integer",
      });
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: parsedCategoryId },
    });

    if (!categoryExists) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    const product = await prisma.product.create({
      data: {
        category_id: parsedCategoryId,
        nama: String(nama).trim(),
        price: parsedPrice.toFixed(2),
        stock: parsedStock,
        description: description ?? null,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
      },
    });

    return res.status(201).json({
      status: true,
      message: "Create product success",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Create product failed",
      error: error.message,
    });
  }
};

// update
export const updateProduct = async (req, res) => {
  const id = Number(req.params.id);
  const { category_id, nama, price, stock, description, is_active } = req.body;

  try {
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid product id",
      });
    }

    const dataToUpdate = {};

    if (category_id !== undefined) {
      const parsedCategoryId = Number(category_id);
      if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
        return res.status(400).json({
          status: false,
          message: "Invalid category_id",
        });
      }
      const categoryExists = await prisma.category.findUnique({
        where: { id: parsedCategoryId },
      });
      if (!categoryExists) {
        return res.status(404).json({
          status: false,
          message: "Category not found",
        });
      }
      dataToUpdate.category_id = parsedCategoryId;
    }

    if (nama !== undefined) {
      if (!String(nama).trim()) {
        return res.status(400).json({
          status: false,
          message: "Product nama cannot be empty",
        });
      }
      dataToUpdate.nama = String(nama).trim();
    }

    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          status: false,
          message: "Invalid price",
        });
      }
      dataToUpdate.price = parsedPrice.toFixed(2);
    }

    if (stock !== undefined) {
      const parsedStock = Number(stock);
      if (!Number.isInteger(parsedStock) || parsedStock < 0) {
        return res.status(400).json({
          status: false,
          message: "Invalid stock",
        });
      }
      dataToUpdate.stock = parsedStock;
    }

    if (description !== undefined) {
      dataToUpdate.description = description;
    }

    if (is_active !== undefined) {
      dataToUpdate.is_active = Boolean(is_active);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.status(200).json({
      status: true,
      message: "Update product success",
      data: updated,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    return res.status(500).json({
      status: false,
      message: "Update product failed",
      error: error.message,
    });
  }
};

// delete
export const deleteProduct = async (req, res) => {
  const id = Number(req.params.id);

  try {
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid product id",
      });
    }

    const deleted = await prisma.product.delete({
      where: { id },
    });

    return res.status(200).json({
      status: true,
      message: "Delete product success",
      data: deleted,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        status: false,
        message: "Product is already used in orders",
      });
    }

    return res.status(500).json({
      status: false,
      message: "Delete product failed",
      error: error.message,
    });
  }
};