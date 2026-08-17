import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.branch.findMany();
  }

  getById(id: string) {
    return this.prisma.branch.findUnique({
      where: { id },
    });
  }

  create(dto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: dto,
    });
  }

  update(id: string, dto: UpdateBranchDto) {
    return this.prisma.branch.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.branch.delete({
      where: { id },
    });
  }
}
