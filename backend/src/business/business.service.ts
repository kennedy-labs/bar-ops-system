import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.business.findMany();
  }

  async getById(id: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
    });
    if (!business) {
      throw new NotFoundException(`Business ${id} not found`);
    }
    return business;
  }

  create(body: CreateBusinessDto) {
    return this.prisma.business.create({
      data: body,
    });
  }

  async update(id: string, body: UpdateBusinessDto) {
    const business = await this.prisma.business.findUnique({
      where: { id },
    });
    if (!business) {
      throw new NotFoundException(`Business ${id} not found`);
    }
    return this.prisma.business.update({
      where: { id },
      data: body,
    });
  }

  async remove(id: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
    });
    if (!business) {
      throw new NotFoundException(`Business ${id} not found`);
    }
    try {
      return await this.prisma.business.delete({
        where: { id },
      });
    } catch (error) {
      // Foreign key constraint violation - business has dependent operational data
      throw new ConflictException(
        `Business ${id} cannot be deleted because it has dependent operational data`,
      );
    }
  }
}
