import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MpesaAccountsService } from './mpesa-accounts.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMpesaAccountDto } from './dto/create-mpesa-account.dto';
import { UpdateMpesaAccountDto } from './dto/update-mpesa-account.dto';

describe('MpesaAccountsService', () => {
  let service: MpesaAccountsService;
  let prisma: any;

  const business = { id: 'biz1', name: 'Business A' };
  const account = {
    id: 'account1',
    businessId: 'biz1',
    accountIdentifier: 'MPESA123',
    displayName: 'Primary Mpesa',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      business: {
        findUnique: jest.fn(),
      },
      branch: {
        findUnique: jest.fn(),
      },
      mpesaAccount: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MpesaAccountsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<MpesaAccountsService>(MpesaAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates an active Mpesa account when business exists and no duplicate exists', async () => {
      prisma.business.findUnique.mockResolvedValue(business);
      prisma.branch.findUnique.mockResolvedValue({ id: 'branch1', businessId: 'biz1' });
      prisma.mpesaAccount.findFirst.mockResolvedValue(null);
      prisma.mpesaAccount.create.mockResolvedValue(account);

      const dto: CreateMpesaAccountDto = {
        branchId: 'branch1',
        accountIdentifier: 'MPESA123',
        displayName: 'Primary Mpesa',
      } as any;

      const result = await service.create('biz1', dto);

      expect(result).toEqual(account);
      expect(prisma.mpesaAccount.create).toHaveBeenCalledWith({
        data: {
          businessId: 'biz1',
          branchId: 'branch1',
          accountIdentifier: 'MPESA123',
          displayName: 'Primary Mpesa',
          status: 'ACTIVE',
        },
      });
    });

    it('throws NotFoundException when business does not exist', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      const dto: CreateMpesaAccountDto = {
        accountIdentifier: 'MPESA123',
        displayName: 'Primary Mpesa',
      } as any;

      await expect(service.create('biz1', dto)).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when duplicate account exists', async () => {
      prisma.business.findUnique.mockResolvedValue(business);
      prisma.branch.findUnique.mockResolvedValue({ id: 'branch1', businessId: 'biz1' });
      prisma.mpesaAccount.findFirst.mockResolvedValue(account);

      const dto: CreateMpesaAccountDto = {
        branchId: 'branch1',
        accountIdentifier: 'MPESA123',
        displayName: 'Primary Mpesa',
      } as any;

      await expect(service.create('biz1', dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getById', () => {
    it('returns account when it belongs to the business', async () => {
      prisma.mpesaAccount.findFirst.mockResolvedValue(account);

      const result = await service.getById('account1', 'biz1');

      expect(result).toEqual(account);
    });

    it('throws NotFoundException when account does not belong to the business', async () => {
      prisma.mpesaAccount.findFirst.mockResolvedValue(null);

      await expect(service.getById('account1', 'biz2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates allowed fields and returns updated account', async () => {
      prisma.mpesaAccount.findFirst
        .mockResolvedValueOnce(account)
        .mockResolvedValueOnce(null);
      prisma.mpesaAccount.update.mockResolvedValue({
        ...account,
        displayName: 'Updated Mpesa',
      });

      const dto: UpdateMpesaAccountDto = {
        displayName: 'Updated Mpesa',
      } as any;

      const result = await service.update('account1', 'biz1', dto as any);

      expect(result).toEqual({
        ...account,
        displayName: 'Updated Mpesa',
      });
      expect(prisma.mpesaAccount.update).toHaveBeenCalledWith({
        where: { id: 'account1' },
        data: { displayName: 'Updated Mpesa' },
      });
    });

    it('throws ConflictException when updated identifier collides for the same business', async () => {
      prisma.mpesaAccount.findFirst
        .mockResolvedValueOnce(account)
        .mockResolvedValueOnce({ id: 'existing', businessId: 'biz1' });

      const dto: UpdateMpesaAccountDto = {
        accountIdentifier: 'other',
      } as any;

      await expect(
        service.update('account1', 'biz1', dto as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deactivate', () => {
    it('deactivates an active account', async () => {
      prisma.mpesaAccount.findFirst.mockResolvedValue(account);
      prisma.mpesaAccount.update.mockResolvedValue({
        ...account,
        status: 'INACTIVE',
      });

      const result = await service.deactivate('account1', 'biz1');

      expect(result.status).toEqual('INACTIVE');
      expect(prisma.mpesaAccount.update).toHaveBeenCalledWith({
        where: { id: 'account1' },
        data: { status: 'INACTIVE' },
      });
    });
  });
});
