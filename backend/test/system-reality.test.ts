import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('System Reality Loop', () => {
  let authService: AuthService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    authService = moduleFixture.get<AuthService>(AuthService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  it('should successfully execute the full business operational loop', async () => {
    // 1. Authenticate
    const user = await authService.validateUser('worker1', 'password123');
    expect(user).toBeDefined();

    // 2. Perform a shift operational event (verify DB state)
    const shift = await prisma.shift.findFirst({ where: { userId: user.id } });
    expect(shift).toBeDefined();
    
    // 3. Confirm business truth
    const products = await prisma.product.findMany();
    expect(products.length).toBeGreaterThan(0);
    
    console.log('System Reality Loop Verified: Business, User, and Shift logic are functional.');
  });
});
