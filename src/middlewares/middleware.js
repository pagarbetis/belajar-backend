import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Invalid credential",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    // Opsional tapi aman: ambil data terbaru dari DB biar role & status selalu sinkron
    const dbUser = await prisma.user.findUnique({
      where: { id: decode.id ?? decode.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!dbUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid credential",
      });
    }

    if (String(dbUser.status).toUpperCase() === "INACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    req.user = {
      ...decode,
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      status: dbUser.status,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid credential",
      error: error.message,
    });
  }
};

export const authorizeRole = (...allowedRoles) => {
  const normalizedAllowed = allowedRoles.map((r) => String(r).toUpperCase());

  return (req, res, next) => {
    const userRole = String(req.user?.role ?? "").toUpperCase();

    if (!userRole || !normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient role permission",
      });
    }

    return next();
  };
};