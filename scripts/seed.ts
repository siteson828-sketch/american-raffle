import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import { resolve } from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });

const connectionString =
  process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || "";
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: "admin@americanraffle.com" } });
  if (!existing) {
    const pw = await bcrypt.hash("admin1234", 12);
    await prisma.user.create({
      data: { email: "admin@americanraffle.com", name: "Admin", password: pw, role: "admin", mustChangePassword: true },
    });
    console.log("Admin created: admin@americanraffle.com / admin1234 (must change password on first login)");
  } else {
    // Ensure existing admin is flagged to change their default password
    if (!existing.mustChangePassword) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { mustChangePassword: true },
      });
      console.log("Admin flagged: must change password on next login");
    } else {
      console.log("Admin already exists");
    }
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
}

main().catch(console.error).finally(() => prisma.$disconnect());
