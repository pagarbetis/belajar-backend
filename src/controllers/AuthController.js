import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import prisma from "../config/prisma.js"

const USERS = [
  {
    nama: "Angga",
    email: "Admin@gmail.com",
    password: "12345678",
  },
];

export const login = async (req, res) => {
  try {
    // Antisipasi kalau req.body bener-bener undefined/kosong
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: false,
        message: "Body request tidak boleh kosong, tolol! Pake format JSON ya.",
      });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid credential",
      });
    }

    // Deklarasikan isMatch di sini
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (err) {
      console.error("Error bcrypt compare (Kemungkinan password DB belum di-hash):", err.message);
    }

    console.log("Hasil IsMatch:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid credential",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        nama: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );

    return res.status(200).json({
      status: true,
      message: "Login Success",
      data: {
        user: {
          id: user.id || 1,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });

  } catch (error) {
    return res.status(500).json({ status: false, message: "Internal server error", error: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const userId = req.user.ID

    const user = await prisma.user.findUnique({
      where: {id: userId},
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      }
    })

    return res.status(200).json({
      status: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      status:false,
      message: "Internal server error", 
      error: error.message
    })
  }
}