import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(businessId: string) {
    return this.prisma.branch.findMany({
      where: { businessId },
    });
  }

  getById(id: string, businessId: string) {
    return this.prisma.branch.findFirst({
      where: { id, businessId },
    });
  }

  create(businessId: string, dto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: { ...dto, businessId },
    });
  }

  update(id: string, businessId: string, dto: UpdateBranchDto) {
    return this.prisma.branch.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string, businessId: string) {
    return this.prisma.branch.delete({
      where: { id },
    });
  }
}
