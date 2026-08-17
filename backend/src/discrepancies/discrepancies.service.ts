import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscrepancyDto } from './dto/create-discrepancy.dto';
import { ResolveDiscrepancyDto } from './dto/resolve-discrepancy.dto';
import { UpdateDiscrepancyDto } from './dto/update-discrepancy.dto';

@Injectable()
export class DiscrepanciesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    businessId: string,
    filters: {
      branchId?: string;
      shiftId?: string;
      type?: string;
      status?: string;
      from?: string;
      to?: string;
    } = {},
  ) {
    const where: any = { businessId };

    if (filters.branchId) {
      where.branchId = filters.branchId;
    }
    if (filters.shiftId) {
      where.shiftId = filters.shiftId;
    }
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) {
        const fromDate = new Date(filters.from);
        if (Number.isNaN(fromDate.getTime())) {
          throw new BadRequestException('from must be a valid ISO date string');
        }
        where.createdAt.gte = fromDate;
      }
      if (filters.to) {
        const toDate = new Date(filters.to);
        if (Number.isNaN(toDate.getTime())) {
          throw new BadRequestException('to must be a valid ISO date string');
        }
        where.createdAt.lte = toDate;
      }
    }

    return this.prisma.discrepancy.findMany({ where });
  }

  async findOne(id: string, businessId: string) {
    const discrepancy = await this.prisma.discrepancy.findFirst({
      where: { id, businessId },
    });
    if (!discrepancy) {
      throw new NotFoundException(
        `Discrepancy ${id} not found for business ${businessId}`,
      );
    }
    return discrepancy;
  }

  async create(body: CreateDiscrepancyDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: body.businessId },
    });
    if (!business) {
      throw new NotFoundException(`Business ${body.businessId} not found`);
    }

    const branch = await this.prisma.branch.findUnique({
      where: { id: body.branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch ${body.branchId} not found`);
    }

    if (branch.businessId !== business.id) {
      throw new BadRequestException(
        `Branch ${body.branchId} does not belong to business ${business.id}`,
      );
    }

    let shiftId: string | undefined;
    if (body.shiftId) {
      const shift = await this.prisma.shift.findUnique({
        where: { id: body.shiftId },
      });
      if (!shift) {
        throw new NotFoundException(`Shift ${body.shiftId} not found`);
      }
      if (shift.branchId !== branch.id) {
        throw new BadRequestException(
          `Shift ${body.shiftId} does not belong to branch ${branch.id}`,
        );
      }
      shiftId = shift.id;
    }

    const variance = new Prisma.Decimal(body.actualValue).minus(
      new Prisma.Decimal(body.expectedValue),
    );
    if (variance.equals(0)) {
      throw new BadRequestException('Variance must be non-zero');
    }

    const existing = await this.prisma.discrepancy.findUnique({
      where: { sourceReference: body.sourceReference },
    });
    if (existing) {
      throw new ConflictException(
        `Discrepancy for sourceReference ${body.sourceReference} already exists`,
      );
    }

    return this.prisma.discrepancy.create({
      data: {
        businessId: business.id,
        branchId: branch.id,
        shiftId,
        transferId: body.transferId,
        stockMovementId: body.stockMovementId,
        expenseId: body.expenseId,
        createdById: body.createdById,
        type: body.type,
        status: 'OPEN',
        expectedValue: body.expectedValue,
        actualValue: body.actualValue,
        variance,
        description: body.description,
        sourceReference: body.sourceReference,
        resolution: body.resolution,
      },
    });
  }

  async resolve(id: string, businessId: string, body: ResolveDiscrepancyDto) {
    const discrepancy = await this.prisma.discrepancy.findFirst({
      where: { id, businessId },
    });
    if (!discrepancy) {
      throw new NotFoundException(
        `Discrepancy ${id} not found for business ${businessId}`,
      );
    }
    if (discrepancy.status !== 'OPEN') {
      throw new BadRequestException('Only OPEN discrepancies can be resolved');
    }

    return this.prisma.discrepancy.update({
      where: { id },
      data: {
        resolution: body.resolution,
        status: body.status ?? 'RESOLVED',
      },
    });
  }

  update(id: string, body: UpdateDiscrepancyDto) {
    return this.prisma.discrepancy.update({ where: { id }, data: body as any });
  }

  remove(id: string) {
    throw new BadRequestException('Discrepancies cannot be deleted');
  }
}
