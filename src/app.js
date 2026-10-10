import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
// import { login } from "./controllers/AuthController.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
// app.post("/api/auth/login", login);

app.get("/", (req, res) => {
  // req: mengambil data dari body dan parameter
  res.json({ message: "Wellcome to POS API" });
});

export default app;
