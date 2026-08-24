import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const demoNames = ['worker1', 'owner1'];
  const deleted = await prisma.user.deleteMany({
    where: { name: { in: demoNames } },
  });
  console.log(`Deleted ${deleted.count} demo user(s).`);
  const remaining = await prisma.user.findMany({ select: { name: true } });
  console.log('Remaining users:', remaining.length === 0 ? '(none)' : remaining.map((u) => u.name).join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });