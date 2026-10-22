import { Router } from "express";
import {
  getAllProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../validations/productValidation.js";
import { validate } from "../middlewares/validationMiddleware.js";

const router = Router();

router.get("/", getAllProduct);
router.get("/:id", getProductById);
router.post("/", validate(createProductSchema), createProduct);
router.put("/:id", validate(updateProductSchema), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
