import { Router } from "express";
import {
  getAllUser,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/middleware.js";
import { createSchema, updateSchema } from "../validations/userValidation.js";
import { validate } from "../middlewares/validationMiddleware.js";

const router = Router();

router.use(verifyToken);
router.get("/", getAllUser);
router.get("/:id", getUserById);
router.post("/", validate(createSchema), createUser);
router.put("/:id", validate(updateSchema), updateUser);
router.delete("/:id", deleteUser);

export default router;
