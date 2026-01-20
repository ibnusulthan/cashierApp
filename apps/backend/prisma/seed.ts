import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ----- 1. USERS -----
  const adminPassword = await bcrypt.hash("admin123", 10);
  const cashier1Password = await bcrypt.hash("cashier123", 10);
  const cashier2Password = await bcrypt.hash("cashier123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      username: "admin",
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const cashier1 = await prisma.user.create({
    data: {
      name: "Cashier One",
      username: "cashier1",
      password: cashier1Password,
      role: UserRole.CASHIER,
    },
  });

  const cashier2 = await prisma.user.create({
    data: {
      name: "Cashier Two",
      username: "cashier2",
      password: cashier2Password,
      role: UserRole.CASHIER,
    },
  });

  console.log("✅ Users created");

  // ----- 2. CATEGORIES -----
  const foodCategory = await prisma.category.create({
    data: { name: "Food" },
  });

  const drinkCategory = await prisma.category.create({
    data: { name: "Drink" },
  });

  console.log("✅ Categories created");

  // ----- 3. PRODUCTS -----
  const products = await prisma.product.createMany({
    data: [
      {
        name: "Burger",
        price: 25000,
        stock: 50,
        categoryId: foodCategory.id,
      },
      {
        name: "Fries",
        price: 15000,
        stock: 80,
        categoryId: foodCategory.id,
      },
      {
        name: "Chicken Wings",
        price: 30000,
        stock: 40,
        categoryId: foodCategory.id,
      },
      {
        name: "Coke",
        price: 10000,
        stock: 100,
        categoryId: drinkCategory.id,
      },
      {
        name: "Iced Tea",
        price: 8000,
        stock: 120,
        categoryId: drinkCategory.id,
      },
    ],
  });

  console.log("✅ Products created");

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
