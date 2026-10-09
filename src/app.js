import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
// import { login } from "./controllers/AuthController.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// app.post("/api/auth/login", login);

app.get("/", (req, res) => {
  // req: mengambil data dari body dan parameter
  res.json({ message: "Wellcome to POS API" });
});

export default app;
