import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

  // 5. Create Worker User
  const password = await bcrypt.hash('password123', 10);
  const existingWorker = await prisma.user.findFirst({
    where: { name: 'worker1', businessId: business.id },
  });
  if (existingWorker) {
    await prisma.user.update({
      where: { id: existingWorker.id },
      data: { password, role: 'WORKER' },
    });
  } else {
    await prisma.user.create({
      data: {
        name: 'worker1',
        password,
        role: 'WORKER',
        businessId: business.id,
      },
    });
  }

  // 6. Create Owner User
  const existingOwner = await prisma.user.findFirst({
    where: { name: 'owner1', businessId: business.id },
  });
  if (existingOwner) {
    await prisma.user.update({
      where: { id: existingOwner.id },
      data: { password, role: 'OWNER' },
    });
  } else {
    await prisma.user.create({
      data: {
        name: 'owner1',
        password,
        role: 'OWNER',
        businessId: business.id,
      },
    });
  }

  // 7. Create Initial Inventory
  const counterLocation = await prisma.stockLocation.upsert({
    where: { id: 'counter-main' },
    update: { name: 'Counter', type: 'COUNTER', branchId: branch.id },
    create: {
      id: 'counter-main',
      name: 'Counter',
      type: 'COUNTER',
      branchId: branch.id,
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
