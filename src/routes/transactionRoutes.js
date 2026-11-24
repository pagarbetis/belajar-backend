import { Router } from "express";
import {
  createTransaction,
  getAllTransaction,
  continueTransaction,
  deleteTransaction,
  syncTransactionStatus,
  midtransNotification,
} from "../controllers/transactionController.js";
import { verifyToken, authorizeRole } from "../middlewares/middleware.js";

const router = Router();

// Webhook Midtrans (tanpa verifyToken karena dipanggil server Midtrans)
router.post("/notification", midtransNotification);

router.use(verifyToken);

router.get("/sync-status", authorizeRole("ADMIN", "CASHIER"), syncTransactionStatus);
router.post("/", authorizeRole("ADMIN", "CASHIER"), createTransaction);
router.get("/", authorizeRole("ADMIN", "CASHIER"), getAllTransaction);
router.post("/:id/continue", authorizeRole("ADMIN", "CASHIER"), continueTransaction);
router.delete("/:id", authorizeRole("ADMIN", "CASHIER"), deleteTransaction);

export default router;