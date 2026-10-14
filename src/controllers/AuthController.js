import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
const USERS = [
  {
    nama: "Angga",
    email: "Admin@gmail.com",
    password: "12345678",
  },
];

export const login = async (req, res) => {
  // Antisipasi kalau req.body bener-bener undefined/kosong
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      status: false,
      message: "Body request tidak boleh kosong, tolol! Pake format JSON ya.",
    });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    // WAJIB PAKAI RETURN SUPAYA GA LANJUT EKSEKUSI KE BAWAH!
    return res.status(400).json({
      status: false,
      message: "Email atau Password required",
    });
  }

  // const user = USERS.find((u) => u.email === email && u.password === password);
  const [user] = await pool.query(
    "SELECT id, name, email, password FROM users WHERE email= ?",
    [email],
  );
  if (user.length === 0) {
    return res.status(401).json({
      status: false,
      message: "Invalid credential",
    });
  }

  const dataUser = user[0];
  const isMatch = await bcrypt.compare(password, dataUser.password);

  if (!isMatch) {
    // 401: unauthorize
    return res.status(401).json({
      status: false,
      message: "Invalid credential",
    });
  }

  const token = jwt.sign(
    {
      id: dataUser.id,
      nama: dataUser.name,
      email: dataUser.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );

  return res.status(200).json({
    status: true,
    message: "Login Success",
    data: {
      user: {
        id: dataUser.id || 1, // Antisipasi kalau id-nya undefined
        name: dataUser.name,
        email: dataUser.email,
      },
      token,
    },
  });
};
