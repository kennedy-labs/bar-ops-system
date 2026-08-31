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
    where: {
      businessId_name: { businessId: business.id, name: 'Tusker(canned)' },
    },
    update: { name: 'Tusker(canned)' },
    create: {
      name: 'Tusker(canned)',
      sellingPrice: 280,
      businessId: business.id,
    },
  });

  // 4. Create Product Unit
  let existingUnit = await prisma.productUnit.findFirst({
    where: { productId: product.id, name: 'Piece' },
  });
  if (!existingUnit) {
    existingUnit = await prisma.productUnit.create({
      data: {
        name: 'Piece',
        symbol: 'pc',
        quantity: 1,
        conversionFactor: 1,
        isDefault: true,
        status: 'ACTIVE',
        productId: product.id,
      },
    });
  }

  // 5. Create Stock Location (business-level)
  const counterLocation = await prisma.stockLocation.upsert({
    where: { id: 'counter-main' },
    update: {
      name: 'Counter',
      type: 'COUNTER',
      businessId: business.id,
      description: 'Main counter',
    },
    create: {
      id: 'counter-main',
      name: 'Counter',
      type: 'COUNTER',
      businessId: business.id,
      description: 'Main counter',
      status: 'ACTIVE',
    },
  });

  // 6. Create Initial Inventory
  await prisma.inventoryItem.upsert({
    where: { id: 'init-inventory' },
    update: {
      quantity: 50,
      branchId: branch.id,
      productId: product.id,
      productUnitId: existingUnit.id,
      stockLocationId: counterLocation.id,
    },
    create: {
      id: 'init-inventory',
      quantity: 50,
      branchId: branch.id,
      productId: product.id,
      productUnitId: existingUnit.id,
      stockLocationId: counterLocation.id,
    },
  });

  // 7. Create Owner user and associate with business
  const owner = await prisma.user.upsert({
    where: { id: 'owner-1' },
    update: { name: 'Owner' },
    create: {
      id: 'owner-1',
      name: 'Owner',
      role: 'OWNER',
      status: 'ACTIVE',
      password: 'owner123',
    },
  });

  await prisma.userBusiness.upsert({
    where: { userId_businessId: { userId: owner.id, businessId: business.id } },
    update: { role: 'OWNER' },
    create: {
      userId: owner.id,
      businessId: business.id,
      role: 'OWNER',
    },
  });

  // 8. Create Worker user and associate with business
  const worker = await prisma.user.upsert({
    where: { id: 'worker-1' },
    update: { name: 'Worker' },
    create: {
      id: 'worker-1',
      name: 'Worker',
      role: 'WORKER',
      status: 'ACTIVE',
      password: 'worker123',
      branchId: branch.id,
    },
  });

  await prisma.userBusiness.upsert({
    where: {
      userId_businessId: { userId: worker.id, businessId: business.id },
    },
    update: { role: 'WORKER' },
    create: {
      userId: worker.id,
      businessId: business.id,
      role: 'WORKER',
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
