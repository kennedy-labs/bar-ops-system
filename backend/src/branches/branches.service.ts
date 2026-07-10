import { Injectable } from '@nestjs/common';

@Injectable()
export class BranchesService {
  getAll() {
    return { message: 'Get all branches' };
  }

  getById(id: string) {
    return { message: `Get branch ${id}` };
  }

  create(body: unknown) {
    return {
      message: 'Create branch',
      data: body,
    };
  }

  update(id: string, body: unknown) {
    return {
      message: `Update branch ${id}`,
      data: body,
    };
  }

  remove(id: string) {
    return { message: `Delete branch ${id}` };
  }
}