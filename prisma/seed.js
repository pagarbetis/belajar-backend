import prisma from "../src/config/prisma.js";
import {userSeeder} from "./seeder/userSeeder.js";

async function main() {
  await userSeeder();
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
