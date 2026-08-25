import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Business (upsert to avoid duplicates on re-run)
  const business = await prisma.business.upsert({
    where: { id: 'joypub' },
    update: { name: 'joypub', currency: 'KES' },
    create: {
      id: 'joypub',
      name: 'joypub',
      currency: 'KES',
    },
  });

  // 2. Create Branch (unique name within business)
  const branch = await prisma.branch.upsert({
    where: { businessId_name: { businessId: business.id, name: 'main' } },
    update: { name: 'main' },
    create: {
      name: 'main',
      businessId: business.id,
    },
  });

  // 3. Create Product (unique name within business)
  const product = await prisma.product.upsert({
    where: { businessId_name: { businessId: business.id, name: 'Tusker(canned)' } },
    update: { sellingPrice: 280 },
    create: {
      name: 'Tusker(canned)',
      sellingPrice: 280,
      businessId: business.id,
    },
  });

        // 4. Create Product Unit
  const existingUnit = await prisma.productUnit.findFirst({
    where: { productId: product.id, name: 'Piece' },
  });
  if (!existingUnit) {
    await prisma.productUnit.create({
      data: {
        name: 'Piece',
        productId: product.id,
      },
    });
  }

  // 5-6. Demo users removed (worker1/owner1) — users are now created
  // through the Owner Management page only.

  // 7. Create Initial Inventory
  const counterLocation = await prisma.stockLocation.upsert({
    where: { id: 'counter-main' },
    update: { name: 'Counter', type: 'COUNTER', branchId: branch.id, businessId: business.id },
    create: {
      id: 'counter-main',
      name: 'Counter',
      type: 'COUNTER',
      branchId: branch.id,
      businessId: business.id,
    },
  });

  await prisma.inventoryItem.upsert({
    where: { id: 'init-inventory' },
    update: { quantity: 50, branchId: branch.id, productId: product.id, stockLocationId: counterLocation.id },
    create: {
      id: 'init-inventory',
      quantity: 50,
      branchId: branch.id,
      productId: product.id,
      stockLocationId: counterLocation.id,
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
