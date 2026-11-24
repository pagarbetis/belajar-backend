import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

export const login = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: false,
        message: "Body request tidak boleh kosong, anjir! Pake format JSON ya.",
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email atau Password required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid credential",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid credential",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        status: false,
        message: "JWT_SECRET belum di-set di .env",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );

    return res.status(200).json({
      status: true,
      message: "Login Success",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Login failed",
      error: error.message,
    });
  }
};