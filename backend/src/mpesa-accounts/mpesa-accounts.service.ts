import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMpesaAccountDto } from './dto/create-mpesa-account.dto';

@Injectable()
export class MpesaAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateMpesaAccountDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: body.businessId },
    });

    if (!business) {
      throw new NotFoundException(`Business ${body.businessId} not found`);
    }

    const accountIdentifier = this.normalizeAccountIdentifier(
      body.accountIdentifier,
    );

    const existingAccount = await this.prisma.mpesaAccount.findFirst({
      where: {
        businessId: body.businessId,
        accountIdentifier,
      },
    });

    if (existingAccount) {
      throw new ConflictException(
        `Mpesa account ${accountIdentifier} already exists for business ${body.businessId}`,
      );
    }

    return this.prisma.mpesaAccount.create({
      data: {
        businessId: body.businessId,
        accountIdentifier,
        displayName: body.displayName,
        status: 'ACTIVE',
      },
    });
  }

  async getAll(businessId: string) {
    return this.prisma.mpesaAccount.findMany({
      where: { businessId },
    });
  }

  async getById(id: string, businessId: string) {
    const account = await this.prisma.mpesaAccount.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!account) {
      throw new NotFoundException(
        `Mpesa account ${id} not found for business ${businessId}`,
      );
    }

    return account;
  }

  async update(
    id: string,
    businessId: string,
    body: Partial<{ accountIdentifier: string; displayName: string }>,
  ) {
    const account = await this.prisma.mpesaAccount.findFirst({
      where: { id, businessId },
    });
    if (!account) {
      throw new NotFoundException(
        `Mpesa account ${id} not found for business ${businessId}`,
      );
    }

    const data: any = {};
    if (body.accountIdentifier) {
      const normalized = this.normalizeAccountIdentifier(
        body.accountIdentifier,
      );
      const conflict = await this.prisma.mpesaAccount.findFirst({
        where: { businessId, accountIdentifier: normalized, NOT: { id } },
      });
      if (conflict) {
        throw new ConflictException(
          `Mpesa account ${normalized} already exists for business ${businessId}`,
        );
      }
      data.accountIdentifier = normalized;
    }

    if (body.displayName) {
      data.displayName = body.displayName;
    }

    if (Object.keys(data).length === 0) return account;

    return this.prisma.mpesaAccount.update({ where: { id }, data });
  }

  async deactivate(id: string, businessId: string) {
    const account = await this.prisma.mpesaAccount.findFirst({
      where: { id, businessId },
    });
    if (!account) {
      throw new NotFoundException(
        `Mpesa account ${id} not found for business ${businessId}`,
      );
    }

    if (account.status !== 'ACTIVE') {
      return account;
    }

    return this.prisma.mpesaAccount.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  private normalizeAccountIdentifier(value: string) {
    return value.trim();
  }
}
