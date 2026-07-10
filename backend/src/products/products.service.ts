import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  getAll() {
    return { message: 'Get all products' };
  }

  getById(id: string) {
    return { message: `Get product ${id}` };
  }

  create(body: unknown) {
    return {
      message: 'Create product',
      data: body,
    };
  }

  update(id: string, body: unknown) {
    return {
      message: `Update product ${id}`,
      data: body,
    };
  }

  remove(id: string) {
    return { message: `Delete product ${id}` };
  }
}