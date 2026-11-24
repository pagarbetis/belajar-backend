import { Router } from "express";
import { verifyToken, authorizeRole } from "../middlewares/middleware.js";
import {
  getAllProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = Router();

router.get("/", verifyToken, authorizeRole("ADMIN", "CASHIER"), getAllProduct);
router.get("/:id", verifyToken, authorizeRole("ADMIN", "CASHIER"), getProductById);
router.post("/", verifyToken, authorizeRole("ADMIN"), createProduct);
router.put("/:id", verifyToken, authorizeRole("ADMIN"), updateProduct);
router.delete("/:id", verifyToken, authorizeRole("ADMIN"), deleteProduct);

export default router;