import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMpesaTransactionDto } from './dto/create-mpesa-transaction.dto';
import { UpdateMpesaTransactionDto } from './dto/update-mpesa-transaction.dto';

@Injectable()
export class MpesaTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(businessId: string, body: CreateMpesaTransactionDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException(`Business ${businessId} not found`);
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

    const mpesaAccount = await this.prisma.mpesaAccount.findFirst({
      where: { id: body.mpesaAccountId, businessId },
    });
    if (!mpesaAccount) {
      throw new NotFoundException(
        `Mpesa account ${body.mpesaAccountId} not found for business ${businessId}`,
      );
    }

    if (mpesaAccount.status !== 'ACTIVE') {
      throw new BadRequestException(
        `Mpesa account ${body.mpesaAccountId} is inactive and cannot receive new transactions`,
      );
    }

    if (body.amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const transactionTime = new Date(body.transactionTime);
    if (Number.isNaN(transactionTime.getTime())) {
      throw new BadRequestException(
        'transactionTime must be a valid ISO date string',
      );
    }

    const existingTransaction = await this.prisma.mpesaTransaction.findFirst({
      where: {
        mpesaAccountId: body.mpesaAccountId,
        transactionReference: body.transactionReference,
      },
    });
    if (existingTransaction) {
      return existingTransaction;
    }

    let shiftId: string | undefined;
    if (body.shiftId) {
      const shift = await this.prisma.shift.findFirst({
        where: {
          id: body.shiftId,
          branch: {
            businessId,
          },
        },
      });
      if (!shift) {
        throw new NotFoundException(
          `Shift ${body.shiftId} not found for business ${businessId}`,
        );
      }
      if (shift.closedAt !== null) {
        throw new BadRequestException(
          `Shift ${body.shiftId} is not eligible for transaction attribution`,
        );
      }
      shiftId = body.shiftId;
    }

    try {
      return await this.prisma.mpesaTransaction.create({
        data: {
          businessId,
          branchId: body.branchId,
          mpesaAccountId: body.mpesaAccountId,
          shiftId,
          transactionReference: body.transactionReference,
          transactionType: body.transactionType,
          amount: body.amount,
          transactionTime,
          sender: body.sender,
          receiver: body.receiver,
          status: 'RECEIVED',
          reconciliationStatus: 'UNRECONCILED',
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const retryTransaction = await this.prisma.mpesaTransaction.findFirst({
          where: {
            mpesaAccountId: body.mpesaAccountId,
            transactionReference: body.transactionReference,
          },
        });
        if (retryTransaction) {
          return retryTransaction;
        }
      }
      throw error;
    }
  }

  async getById(id: string, businessId: string) {
    const transaction = await this.prisma.mpesaTransaction.findFirst({
      where: { id, businessId },
    });
    if (!transaction) {
      throw new NotFoundException(
        `Mpesa transaction ${id} not found for business ${businessId}`,
      );
    }
    return transaction;
  }

  async findAll(
    businessId: string,
    filters: {
      mpesaAccountId?: string;
      branchId?: string;
      shiftId?: string;
      transactionType?: string;
      status?: string;
      reconciliationStatus?: string;
      from?: string;
      to?: string;
    } = {},
  ) {
    const where: any = { businessId };

    if (filters.mpesaAccountId) {
      where.mpesaAccountId = filters.mpesaAccountId;
    }
    if (filters.branchId) {
      where.branchId = filters.branchId;
    }
    if (filters.shiftId) {
      where.shiftId = filters.shiftId;
    }
    if (filters.transactionType) {
      where.transactionType = filters.transactionType;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.reconciliationStatus) {
      where.reconciliationStatus = filters.reconciliationStatus;
    }
    if (filters.from || filters.to) {
      where.transactionTime = {};
      if (filters.from) {
        const fromDate = new Date(filters.from);
        if (Number.isNaN(fromDate.getTime())) {
          throw new BadRequestException('from must be a valid ISO date string');
        }
        where.transactionTime.gte = fromDate;
      }
      if (filters.to) {
        const toDate = new Date(filters.to);
        if (Number.isNaN(toDate.getTime())) {
          throw new BadRequestException('to must be a valid ISO date string');
        }
        where.transactionTime.lte = toDate;
      }
    }

    return this.prisma.mpesaTransaction.findMany({ where });
  }

  async update(
    id: string,
    businessId: string,
    body: UpdateMpesaTransactionDto,
  ) {
    const transaction = await this.prisma.mpesaTransaction.findFirst({
      where: { id, businessId },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Mpesa transaction ${id} not found for business ${businessId}`,
      );
    }

    const data: any = {};
    if (body.status) {
      data.status = body.status;
    }
    if (body.reconciliationStatus) {
      data.reconciliationStatus = body.reconciliationStatus;
    }

    if (Object.keys(data).length === 0) {
      return transaction;
    }

    return this.prisma.mpesaTransaction.update({
      where: { id },
      data,
    });
  }

  async getByShift(shiftId: string, businessId: string) {
    const shift = await this.prisma.shift.findFirst({
      where: {
        id: shiftId,
        branch: {
          is: {
            businessId,
          },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException(
        `Shift ${shiftId} not found for business ${businessId}`,
      );
    }

    return this.prisma.mpesaTransaction.findMany({
      where: { businessId, shiftId },
    });
  }
}
