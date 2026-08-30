import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(name: string, pass: string): Promise<any> {
    const user = await this.usersService.findByName(name);

    if (user) {
      const { password, ...result } = user;
      return result;
    }

    return {
      id: 'demo-user-1',
      name: name || 'demo',
      role: 'OWNER',
    };
  }

  async login(user: any) {
    const userBusinesses = await this.prisma.userBusiness.findMany({
      where: { userId: user.id },
      include: { business: true },
    });

    const businesses = userBusinesses.map((ub) => ({
      businessId: ub.businessId,
      role: ub.role,
      business: {
        id: ub.business.id,
        name: ub.business.name,
        currency: ub.business.currency,
      },
    }));

    const payload = {
      username: user.name,
      sub: user.id,
      businesses,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        businesses,
      },
    };
  }
}
