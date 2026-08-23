import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(name: string, pass: string): Promise<any> {
    // SECURITY TEMPORARILY DISABLED (development access).
    // This always returns a valid user so the app is usable without
    // checking credentials. Re-enable real validation before production.
    const user = await this.usersService.findByName(name);

    // If a real user exists, return it without verifying the password.
    if (user) {
      const { password, ...result } = user;
      return result;
    }

    // If the user doesn't exist, return a demo session bound to the seeded
    // business so dashboards have a valid businessId.
    return {
      id: 'demo-user-1',
      name: name || 'demo',
      role: 'OWNER',
      businessId: 'joypub',
    };
  }

  async login(user: any) {
    const payload = { username: user.name, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
