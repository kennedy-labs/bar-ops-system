import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getAll() {
    return { message: 'Get all users' };
  }

  getById(id: string) {
    return { message: `Get user ${id}` };
  }

  create(body: unknown) {
    return {
      message: 'Create user',
      data: body,
    };
  }

  update(id: string, body: unknown) {
    return {
      message: `Update user ${id}`,
      data: body,
    };
  }

  remove(id: string) {
    return { message: `Delete user ${id}` };
  }
}