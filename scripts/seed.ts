import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import { resolve } from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: resolve(process.cwd(), ".env") });

function makePrisma() {
  const rawUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const url =
    rawUrl.startsWith("file:./") || rawUrl.startsWith("file:../")
      ? "file:" + resolve(process.cwd(), rawUrl.slice(5))
      : rawUrl;
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

async function main() {
  const prisma = makePrisma();
  try {
    const existing = await prisma.user.findUnique({ where: { email: "admin@americanraffle.com" } });
    if (!existing) {
      const pw = await bcrypt.hash("admin1234", 12);
      await prisma.user.create({
        data: { email: "admin@americanraffle.com", name: "Admin", password: pw, role: "admin" },
      });
      console.log("Admin created: admin@americanraffle.com / admin1234");
    } else {
      console.log("Admin already exists");
    }

    const existingRaffle = await prisma.raffle.findFirst({ where: { status: "active" } });
    if (!existingRaffle) {
      await prisma.raffle.create({
        data: {
          title: "Win a 2025 Ford Mustang GT!",
          description: "America's favorite pony car. 450hp, 5.0L V8, iconic styling. Tax and fees covered — just show up and drive away.",
          carMake: "Ford",
          carModel: "Mustang GT",
          carYear: 2025,
          carColor: "Race Red",
          carMsrp: 42995,
          photos: JSON.stringify([]),
          totalTickets: 10000,
          soldTickets: 2743,
          ticketPrice: 10.0,
          taxCovered: true,
          dealerName: "Freedom Ford",
          dealerCity: "Nashville",
          dealerState: "TN",
          status: "active",
        },
      });
      console.log("Sample raffle created: 2025 Ford Mustang GT");
    } else {
      console.log("Active raffle already exists");
    }

    const productCount = await prisma.product.count();
    if (productCount === 0) {
      await prisma.product.createMany({
        data: [
          { name: "American Raffle Flag Tee", description: "Premium cotton t-shirt with American Raffle stars & stripes.", price: 29.99, image: "", category: "apparel" },
          { name: "Patriot Trucker Hat", description: "Embroidered mesh-back trucker cap.", price: 24.99, image: "", category: "apparel" },
          { name: "Stars & Stripes Hoodie", description: "Heavyweight fleece hoodie, perfect for game days.", price: 59.99, image: "", category: "apparel" },
          { name: "Patriot Coffee Mug", description: "15oz ceramic mug, red white & blue design.", price: 19.99, image: "", category: "home" },
          { name: "American Eagle Flag (3x5)", description: "Outdoor flag with brass grommets.", price: 34.99, image: "", category: "home" },
          { name: "Raffle Sticker Pack (5)", description: "5 assorted patriotic vinyl stickers.", price: 9.99, image: "", category: "accessories" },
        ],
      });
      console.log("Sample products created");
    }

    console.log("\nSeed complete!");
    console.log("Admin login: admin@americanraffle.com / admin1234");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
