import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Business
  const business = await prisma.business.create({
    data: {
      name: 'joypub',
      currency: 'KES',
    },
  });

  // 2. Create Branch
  const branch = await prisma.branch.create({
    data: {
      name: 'main',
      businessId: business.id,
    },
  });

  // 3. Create Product
  const product = await prisma.product.create({
    data: {
      name: 'Tusker(canned)',
      sellingPrice: 280,
      businessId: business.id,
    },
  });

  // 4. Create Product Unit
  const unit = await prisma.productUnit.create({
    data: {
      name: 'Piece',
      productId: product.id,
    },
  });

  // 5. Create Worker User
  const password = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'worker1',
      password: password,
      role: 'WORKER',
      businessId: business.id,
    },
  });

  // 6. Create Owner User
  const owner = await prisma.user.create({
    data: {
      name: 'owner1',
      password: password,
      role: 'OWNER',
      businessId: business.id,
    },
  });

  // 7. Create Initial Inventory
  const counterLocation = await prisma.stockLocation.create({
    data: {
      name: 'Counter',
      type: 'COUNTER',
      branchId: branch.id,
    },
  });

  await prisma.inventoryItem.create({
    data: {
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
