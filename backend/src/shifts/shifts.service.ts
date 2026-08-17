import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.shift.findMany();
  }

  getById(id: string) {
    return this.prisma.shift.findUnique({
      where: { id },
    });
  }

  create(body: CreateShiftDto) {
    return this.prisma.shift.create({
      data: body,
    });
  }

  update(id: string, body: UpdateShiftDto) {
    return this.prisma.shift.update({
      where: { id },
      data: body,
    });
  }

  remove(id: string) {
    return this.prisma.shift.delete({
      where: { id },
    });
  }
}
