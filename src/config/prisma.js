import 'dotenv/config'; // 👈 Tambahkan ini di baris paling atas
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./../generated/client.js";

const connectionString = new URL(process.env.DATABASE_URL);

const adapter = new PrismaMariaDb({
  host: connectionString.hostname,
  port: Number(connectionString.port) || 3306,
  user: decodeURIComponent(connectionString.username),
  password: decodeURIComponent(connectionString.password),
  database: connectionString.pathname.replace(/^\//, ""),
});

const prisma = new PrismaClient({
  adapter: adapter,
});

export default prisma;