import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMpesaTransactionDto } from './dto/create-mpesa-transaction.dto';
import { UpdateMpesaTransactionDto } from './dto/update-mpesa-transaction.dto';

// Service boundary: owns validation, account verification, business ownership,
// duplicate detection, transaction creation, shift attribution, and status transitions.
// Must not create Mpesa Accounts, modify Shift records, calculate payment summaries,
// create discrepancies, or generate reports.
@Injectable()
export class MpesaTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateMpesaTransactionDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: body.businessId },
    });
    if (!business) {
      throw new NotFoundException(`Business ${body.businessId} not found`);
    }

    const mpesaAccount = await this.prisma.mpesaAccount.findFirst({
      where: { id: body.mpesaAccountId, businessId: body.businessId },
    });
    if (!mpesaAccount) {
      throw new NotFoundException(
        `Mpesa account ${body.mpesaAccountId} not found for business ${body.businessId}`,
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
        externalTransactionId: body.externalTransactionId,
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
            businessId: body.businessId,
          },
        },
      });
      if (!shift) {
        throw new NotFoundException(
          `Shift ${body.shiftId} not found for business ${body.businessId}`,
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
          businessId: body.businessId,
          mpesaAccountId: body.mpesaAccountId,
          shiftId,
          externalTransactionId: body.externalTransactionId,
          amount: body.amount,
          transactionTime,
          status: 'RECEIVED',
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const retryTransaction = await this.prisma.mpesaTransaction.findFirst({
          where: {
            mpesaAccountId: body.mpesaAccountId,
            externalTransactionId: body.externalTransactionId,
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
      shiftId?: string;
      status?: string;
      from?: string;
      to?: string;
    } = {},
  ) {
    const where: any = { businessId };

    if (filters.mpesaAccountId) {
      where.mpesaAccountId = filters.mpesaAccountId;
    }
    if (filters.shiftId) {
      where.shiftId = filters.shiftId;
    }
    if (filters.status) {
      where.status = filters.status;
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

    if (!body.status) {
      return transaction;
    }

    return this.prisma.mpesaTransaction.update({
      where: { id },
      data: {
        status: body.status,
      },
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
