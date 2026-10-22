import { Router } from "express";
import {
  createTransaction,
  getAllTransaction,
  getTransactionById,
} from "../controllers/transactionController.js";
import { verifyToken } from "../middlewares/middleware.js";
import { createTransactionSchema } from "../validations/transactionValidation.js";
import { validate } from "../middlewares/validationMiddleware.js";

const router = Router();

router.use(verifyToken);
router.post("/", validate(createTransactionSchema), createTransaction);
router.get("/", getAllTransaction);
router.get("/:id", getTransactionById);

export default router
