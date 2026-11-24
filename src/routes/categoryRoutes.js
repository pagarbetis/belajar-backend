import { Router } from "express";
import { verifyToken, authorizeRole } from "../middlewares/middleware.js";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/CategoryController.js";

const router = Router();

router.get("/", verifyToken, authorizeRole("ADMIN", "CASHIER"), getAllCategories);
router.get("/:id", verifyToken, authorizeRole("ADMIN", "CASHIER"), getCategoryById);
router.post("/", verifyToken, authorizeRole("ADMIN"), createCategory);
router.put("/:id", verifyToken, authorizeRole("ADMIN"), updateCategory);
router.delete("/:id", verifyToken, authorizeRole("ADMIN"), deleteCategory);

export default router;