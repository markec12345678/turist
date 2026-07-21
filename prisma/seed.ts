import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import path from "node:path"
import { pathToFileURL } from "node:url"

const dbPath = path.resolve("prisma/dev.db")
const fileUrl = pathToFileURL(dbPath).href
const adapter = new PrismaBetterSqlite3({ url: fileUrl })

const prisma = new PrismaClient({ adapter })

async function main() {
  const { hash } = await import("bcryptjs")
  console.log("🌱 Seeding demo data...\n")

  console.log("🗑️  Deleting existing data...")
  await prisma.stockMovement.deleteMany()
  await prisma.menuItemIngredient.deleteMany()
  await prisma.ingredient.deleteMany()
  await prisma.inventoryCategory.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.folioLineItem.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.folio.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.shift.deleteMany()
  await prisma.cashRegister.deleteMany()
  await prisma.housekeepingTask.deleteMany()
  await prisma.stay.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.menuCategory.deleteMany()
  await prisma.table.deleteMany()
  await prisma.ratePlan.deleteMany()
  await prisma.season.deleteMany()
  await prisma.room.deleteMany()
  await prisma.roomType.deleteMany()
  await prisma.property.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()
  console.log("   ✅ All data deleted\n")

  console.log("🏢 Creating company...")
  const company = await prisma.company.create({
    data: {
      name: "Turist Demo d.o.o.",
      taxNumber: "SI12345678",
      registrationNo: "12345678",
      address: "Cesta 1",
      city: "Ljubljana",
      postalCode: "1000",
      country: "SI",
      phone: "+386 1 234 5678",
      email: "info@turist-demo.si",
    },
  })
  console.log(`   ✅ Company: ${company.name}\n`)

  console.log("👤 Creating users...")
  const admin = await prisma.user.create({
    data: {
      email: "admin@turist-demo.si",
      passwordHash: await hash("admin123", 10),
      name: "Admin Test",
      role: "ADMIN",
      companyId: company.id,
    },
  })
  console.log(`   ✅ Admin: ${admin.email}`)

  await prisma.user.create({
    data: {
      email: "receptor@turist-demo.si",
      passwordHash: await hash("receptor123", 10),
      name: "Ana Receptor",
      role: "RECEPTIONIST",
      companyId: company.id,
    },
  })

  await prisma.user.create({
    data: {
      email: "natakar@turist-demo.si",
      passwordHash: await hash("natakar123", 10),
      name: "Marko Natakar",
      role: "WAITER",
      companyId: company.id,
    },
  })

  await prisma.user.create({
    data: {
      email: "kuhar@turist-demo.si",
      passwordHash: await hash("kuhar123", 10),
      name: "Janez Kuhar",
      role: "CHEF",
      companyId: company.id,
    },
  })

  await prisma.user.create({
    data: {
      email: "cistilka@turist-demo.si",
      passwordHash: await hash("cistilka123", 10),
      name: "Marija Čistilka",
      role: "CLEANER",
      companyId: company.id,
    },
  })
  console.log("   ✅ 5 users created\n")

  console.log("🏨 Creating property...")
  const property = await prisma.property.create({
    data: {
      name: "Hotel Bled",
      type: "HOTEL",
      address: "Cesta okrog Bleda 1",
      city: "Bled",
      companyId: company.id,
    },
  })
  console.log(`   ✅ ${property.name}\n`)

  console.log("🛏️  Creating room types and rooms...")
  const standardRT = await prisma.roomType.create({
    data: { name: "Standard", maxAdults: 2, bedConfiguration: "1x Double" },
  })
  const deluxeRT = await prisma.roomType.create({
    data: { name: "Deluxe", maxAdults: 3, bedConfiguration: "1x King + 1x Single" },
  })
  const suitaRT = await prisma.roomType.create({
    data: { name: "Suita", maxAdults: 4, bedConfiguration: "1x King + 2x Single" },
  })

  const rooms = [
    { number: "101", roomTypeId: standardRT.id, floor: 1, propertyId: property.id },
    { number: "102", roomTypeId: standardRT.id, floor: 1, propertyId: property.id },
    { number: "103", roomTypeId: standardRT.id, floor: 1, propertyId: property.id },
    { number: "201", roomTypeId: deluxeRT.id, floor: 2, propertyId: property.id },
    { number: "202", roomTypeId: deluxeRT.id, floor: 2, propertyId: property.id },
    { number: "301", roomTypeId: suitaRT.id, floor: 3, propertyId: property.id },
  ]
  for (const r of rooms) await prisma.room.create({ data: r })
  console.log("   ✅ 3 room types, 6 rooms\n")

  console.log("📅 Creating seasons and rate plans...")
  const summer = await prisma.season.create({
    data: { name: "Poletje 2026", startDate: new Date("2026-06-01"), endDate: new Date("2026-08-31"), propertyId: property.id },
  })
  await prisma.season.create({
    data: { name: "Zima 2026/27", startDate: new Date("2026-12-01"), endDate: new Date("2027-01-31"), propertyId: property.id },
  })

  await prisma.ratePlan.create({
    data: { name: "BB", code: "BB", basePrice: 85, propertyId: property.id, seasonId: summer.id },
  })
  await prisma.ratePlan.create({
    data: { name: "HB", code: "HB", basePrice: 105, propertyId: property.id, seasonId: summer.id },
  })
  console.log("   ✅ 2 seasons, 2 rate plans\n")

  console.log("🍽️  Creating menu...")
  const predjedi = await prisma.menuCategory.create({
    data: { name: "Predjedi", sortOrder: 0, propertyId: property.id },
  })
  const glavneJedi = await prisma.menuCategory.create({
    data: { name: "Glavne jedi", sortOrder: 1, propertyId: property.id },
  })
  const sladice = await prisma.menuCategory.create({
    data: { name: "Sladice", sortOrder: 2, propertyId: property.id },
  })

  const menuItems = [
    { name: "Šopska solata", price: 8.5, allergens: JSON.stringify(["mleko"]), categoryId: predjedi.id, kitchenStation: "BAR" },
    { name: "Rezanci po tržaško", price: 14.9, allergens: JSON.stringify(["gluten"]), categoryId: glavneJedi.id, kitchenStation: "TOPLOTNO" },
    { name: "Ljubljanski zrezek", price: 18.5, allergens: JSON.stringify([]), categoryId: glavneJedi.id, kitchenStation: "TOPLOTNO" },
    { name: "Palačinke z Nutello", price: 7.5, allergens: JSON.stringify(["jajca", "mleko", "gluten"]), categoryId: sladice.id, kitchenStation: "SLADICE" },
    { name: "Kremšnita", price: 6.9, allergens: JSON.stringify(["jajca", "mleko", "gluten"]), categoryId: sladice.id, kitchenStation: "SLADICE" },
  ]
  for (const item of menuItems) await prisma.menuItem.create({ data: item })
  console.log("   ✅ 3 categories, 5 items\n")

  console.log("🪑 Creating tables...")
  for (const [num, cap] of [[1,4],[2,4],[3,4],[4,4],[5,6],[6,6],[7,6],[8,8],[9,8],[10,8]] as [number, number][]) {
    await prisma.table.create({ data: { number: num, capacity: cap, diningArea: "Jedilnica", propertyId: property.id } })
  }
  console.log("   ✅ 10 tables\n")

  console.log("📦 Creating inventory...")
  const catMesni = await prisma.inventoryCategory.create({ data: { name: "Mesni izdelki", sortOrder: 0, propertyId: property.id } })
  const catZelenjava = await prisma.inventoryCategory.create({ data: { name: "Zelenjava", sortOrder: 1, propertyId: property.id } })
  const catMlecni = await prisma.inventoryCategory.create({ data: { name: "Mlečni izdelki", sortOrder: 2, propertyId: property.id } })
  const catOstalo = await prisma.inventoryCategory.create({ data: { name: "Ostalo", sortOrder: 3, propertyId: property.id } })

  const ingredients = [
    { name: "Piščančje prsi", unit: "KG", currentStock: 8, minStock: 3, costPerUnit: 8.5, categoryId: catMesni.id },
    { name: "Govedji steak", unit: "KG", currentStock: 5, minStock: 2, costPerUnit: 18, categoryId: catMesni.id },
    { name: "Paradajz", unit: "KG", currentStock: 12, minStock: 4, costPerUnit: 2.5, categoryId: catZelenjava.id },
    { name: "Solata", unit: "KG", currentStock: 6, minStock: 3, costPerUnit: 3.2, categoryId: catZelenjava.id },
    { name: "Krompir", unit: "KG", currentStock: 15, minStock: 5, costPerUnit: 1.2, categoryId: catZelenjava.id },
    { name: "Mocarela", unit: "KG", currentStock: 2, minStock: 1, costPerUnit: 9, categoryId: catMlecni.id },
    { name: "Sladka smetana", unit: "L", currentStock: 4, minStock: 2, costPerUnit: 3.5, categoryId: catMlecni.id },
    { name: "Jajca", unit: "KOS", currentStock: 60, minStock: 20, costPerUnit: 0.35, categoryId: catMlecni.id },
    { name: "Moka", unit: "KG", currentStock: 10, minStock: 3, costPerUnit: 1.1, categoryId: catOstalo.id },
    { name: "Olive oil", unit: "L", currentStock: 3, minStock: 1, costPerUnit: 7, categoryId: catOstalo.id },
    { name: "Nutella", unit: "KG", currentStock: 1.5, minStock: 0.5, costPerUnit: 12, categoryId: catOstalo.id },
    { name: "Beluši", unit: "KG", currentStock: 1, minStock: 1.5, costPerUnit: 6, categoryId: catZelenjava.id },
  ]
  for (const ing of ingredients) await prisma.ingredient.create({ data: ing })
  console.log("   ✅ 4 categories, 12 ingredients\n")

  console.log("💵 Creating cash register...")
  await prisma.cashRegister.create({ data: { name: "Glavna blagajna", propertyId: property.id } })
  console.log("   ✅ Done\n")

  console.log("🎉 Seeding completed!")
  console.log("📊 Demo: admin@turist-demo.si / admin123")
}

main()
  .catch((e) => { console.error("❌ Seeding failed:", e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
