import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MpesaTransactionsService } from './mpesa-transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMpesaTransactionDto } from './dto/create-mpesa-transaction.dto';

describe('MpesaTransactionsService', () => {
  let service: MpesaTransactionsService;
  let prisma: any;

  const business = { id: 'biz1', name: 'Business A' };
  const account = {
    id: 'account1',
    businessId: 'biz1',
    accountIdentifier: 'MPESA123',
    displayName: 'Primary Mpesa',
    status: 'ACTIVE',
  };
  const transaction = {
    id: 'tx1',
    businessId: 'biz1',
    mpesaAccountId: 'account1',
    externalTransactionId: 'ext-1',
    amount: 100,
    transactionTime: new Date().toISOString(),
    status: 'RECEIVED',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      business: { findUnique: jest.fn() },
      mpesaAccount: { findFirst: jest.fn() },
      shift: { findFirst: jest.fn() },
      mpesaTransaction: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MpesaTransactionsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<MpesaTransactionsService>(MpesaTransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a transaction when account is active', async () => {
    prisma.business.findUnique.mockResolvedValue(business);
    prisma.mpesaAccount.findFirst.mockResolvedValue(account);
    prisma.mpesaTransaction.findFirst.mockResolvedValue(null);
    prisma.mpesaTransaction.create.mockResolvedValue(transaction);

    const dto: CreateMpesaTransactionDto = {
      businessId: 'biz1',
      mpesaAccountId: 'account1',
      externalTransactionId: 'ext-1',
      amount: 100,
      transactionTime: new Date().toISOString(),
    } as any;

    const result = await service.create(dto);

    expect(result).toEqual(transaction);
    expect(prisma.mpesaTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        businessId: 'biz1',
        mpesaAccountId: 'account1',
        externalTransactionId: 'ext-1',
        amount: 100,
        status: 'RECEIVED',
      }),
    });
  });

  it('throws NotFoundException if business does not exist', async () => {
    prisma.business.findUnique.mockResolvedValue(null);
    const dto: CreateMpesaTransactionDto = {
      businessId: 'biz1',
      mpesaAccountId: 'account1',
      externalTransactionId: 'ext-1',
      amount: 100,
      transactionTime: new Date().toISOString(),
    } as any;

    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException if mpesa account is missing', async () => {
    prisma.business.findUnique.mockResolvedValue(business);
    prisma.mpesaAccount.findFirst.mockResolvedValue(null);
    const dto: CreateMpesaTransactionDto = {
      businessId: 'biz1',
      mpesaAccountId: 'account1',
      externalTransactionId: 'ext-1',
      amount: 100,
      transactionTime: new Date().toISOString(),
    } as any;

    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException if account is inactive', async () => {
    prisma.business.findUnique.mockResolvedValue(business);
    prisma.mpesaAccount.findFirst.mockResolvedValue({
      ...account,
      status: 'INACTIVE',
    });
    const dto: CreateMpesaTransactionDto = {
      businessId: 'biz1',
      mpesaAccountId: 'account1',
      externalTransactionId: 'ext-1',
      amount: 100,
      transactionTime: new Date().toISOString(),
    } as any;

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('attaches shiftId when the shift belongs to the same business and is eligible', async () => {
    prisma.business.findUnique.mockResolvedValue(business);
    prisma.mpesaAccount.findFirst.mockResolvedValue(account);
    prisma.shift.findFirst = jest.fn().mockResolvedValue({
      id: 'shift1',
      branchId: 'branch1',
      userId: 'user1',
      openedAt: new Date(),
      closedAt: null,
    });
    prisma.mpesaTransaction.findFirst.mockResolvedValue(null);
    prisma.mpesaTransaction.create.mockResolvedValue({
      ...transaction,
      shiftId: 'shift1',
    });

    const dto: CreateMpesaTransactionDto = {
      businessId: 'biz1',
      mpesaAccountId: 'account1',
      shiftId: 'shift1',
      externalTransactionId: 'ext-1',
      amount: 100,
      transactionTime: new Date().toISOString(),
    } as any;

    const result = await service.create(dto);

    expect(result).toEqual({
      ...transaction,
      shiftId: 'shift1',
    });
    expect(prisma.shift.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'shift1',
        branch: {
          businessId: 'biz1',
        },
      },
    });
    expect(prisma.mpesaTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        shiftId: 'shift1',
      }),
    });
  });

  it('rejects shift attribution when the shift is not eligible', async () => {
    prisma.business.findUnique.mockResolvedValue(business);
    prisma.mpesaAccount.findFirst.mockResolvedValue(account);
    prisma.shift.findFirst = jest.fn().mockResolvedValue({
      id: 'shift1',
      branchId: 'branch1',
      userId: 'user1',
      openedAt: new Date('2026-08-09T00:00:00Z'),
      closedAt: new Date('2026-08-09T12:00:00Z'),
    });
    const dto: CreateMpesaTransactionDto = {
      businessId: 'biz1',
      mpesaAccountId: 'account1',
      shiftId: 'shift1',
      externalTransactionId: 'ext-1',
      amount: 100,
      transactionTime: new Date().toISOString(),
    } as any;

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('returns existing transaction for duplicate mpesaAccountId and externalTransactionId', async () => {
    prisma.business.findUnique.mockResolvedValue(business);
    prisma.mpesaAccount.findFirst.mockResolvedValue(account);
    prisma.mpesaTransaction.findFirst.mockResolvedValue(transaction);

    const dto: CreateMpesaTransactionDto = {
      businessId: 'biz1',
      mpesaAccountId: 'account1',
      externalTransactionId: 'ext-1',
      amount: 100,
      transactionTime: new Date().toISOString(),
    } as any;

    const result = await service.create(dto);

    expect(prisma.mpesaTransaction.findFirst).toHaveBeenCalledWith({
      where: {
        mpesaAccountId: 'account1',
        externalTransactionId: 'ext-1',
      },
    });
    expect(result).toEqual(transaction);
  });

  it('recovers from concurrent unique constraint conflict and returns existing transaction', async () => {
    prisma.business.findUnique.mockResolvedValue(business);
    prisma.mpesaAccount.findFirst.mockResolvedValue(account);
    prisma.mpesaTransaction.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(transaction);
    prisma.mpesaTransaction.create.mockRejectedValueOnce({ code: 'P2002' });

    const dto: CreateMpesaTransactionDto = {
      businessId: 'biz1',
      mpesaAccountId: 'account1',
      externalTransactionId: 'ext-1',
      amount: 100,
      transactionTime: new Date().toISOString(),
    } as any;

    const result = await service.create(dto);

    expect(prisma.mpesaTransaction.create).toHaveBeenCalled();
    expect(result).toEqual(transaction);
  });

  it('rejects ingestion for a deactivated account while preserving prior history', async () => {
    const firstDto: CreateMpesaTransactionDto = {
      businessId: 'biz1',
      mpesaAccountId: 'account1',
      externalTransactionId: 'ext-1',
      amount: 100,
      transactionTime: new Date().toISOString(),
    } as any;

    prisma.business.findUnique.mockResolvedValue(business);
    prisma.mpesaAccount.findFirst.mockResolvedValueOnce(account);
    prisma.mpesaTransaction.findFirst.mockResolvedValueOnce(null);
    prisma.mpesaTransaction.create.mockResolvedValueOnce(transaction);

    const created = await service.create(firstDto);
    expect(created).toEqual(transaction);

    const secondDto: CreateMpesaTransactionDto = {
      ...firstDto,
      externalTransactionId: 'ext-2',
    } as any;

    prisma.mpesaAccount.findFirst.mockResolvedValueOnce({
      ...account,
      status: 'INACTIVE',
    });

    await expect(service.create(secondDto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws NotFoundException when a different business tries to ingest to the same account', async () => {
    prisma.business.findUnique.mockResolvedValue({
      id: 'biz2',
      name: 'Business B',
    });
    prisma.mpesaAccount.findFirst.mockResolvedValue(null);

    const dto: CreateMpesaTransactionDto = {
      businessId: 'biz2',
      mpesaAccountId: 'account1',
      externalTransactionId: 'ext-3',
      amount: 50,
      transactionTime: new Date().toISOString(),
    } as any;

    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });

  it('returns transaction by id only when business matches', async () => {
    prisma.mpesaTransaction.findFirst.mockResolvedValue(transaction);

    const result = await service.getById('tx1', 'biz1');

    expect(result).toEqual(transaction);
  });

  it('rejects transaction by id for wrong business', async () => {
    prisma.mpesaTransaction.findFirst.mockResolvedValue(null);

    await expect(service.getById('tx1', 'biz2')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('finds transactions with filters and business ownership', async () => {
    prisma.mpesaTransaction.findMany = jest
      .fn()
      .mockResolvedValue([transaction]);

    const result = await service.findAll('biz1', {
      mpesaAccountId: 'account1',
      status: 'RECEIVED',
      from: new Date(Date.now() - 86400000).toISOString(),
      to: new Date().toISOString(),
    });

    expect(result).toEqual([transaction]);
    expect(prisma.mpesaTransaction.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        businessId: 'biz1',
        mpesaAccountId: 'account1',
        status: 'RECEIVED',
      }),
    });
  });

  it('gets transactions for a shift only when the shift belongs to the same business', async () => {
    prisma.shift.findFirst.mockResolvedValue({
      id: 'shift1',
      branchId: 'branch1',
      userId: 'user1',
      openedAt: new Date(),
      closedAt: null,
    });
    prisma.mpesaTransaction.findMany = jest
      .fn()
      .mockResolvedValue([transaction]);

    const result = await service.getByShift('shift1', 'biz1');

    expect(result).toEqual([transaction]);
    expect(prisma.shift.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'shift1',
        branch: {
          is: {
            businessId: 'biz1',
          },
        },
      },
    });
  });

  it('returns the correct shift mpesa total for three transactions belonging to the same shift', async () => {
    const shiftTransactions = [
      { ...transaction, id: 'txA', amount: 500, shiftId: 'shift1' },
      {
        ...transaction,
        id: 'txB',
        amount: 1000,
        externalTransactionId: 'ext-2',
        shiftId: 'shift1',
      },
      {
        ...transaction,
        id: 'txC',
        amount: 750,
        externalTransactionId: 'ext-3',
        shiftId: 'shift1',
      },
    ];

    prisma.shift.findFirst.mockResolvedValue({
      id: 'shift1',
      branchId: 'branch1',
      userId: 'user1',
      openedAt: new Date(),
      closedAt: null,
    });
    prisma.mpesaTransaction.findMany = jest
      .fn()
      .mockResolvedValue(shiftTransactions);

    const result = await service.getByShift('shift1', 'biz1');
    const total = result.reduce((sum, tx) => sum + tx.amount, 0);

    expect(result).toEqual(shiftTransactions);
    expect(total).toEqual(2250);
  });

  it('does not create a second record when the same transaction is submitted twice', async () => {
    prisma.business.findUnique.mockResolvedValue(business);
    prisma.mpesaAccount.findFirst.mockResolvedValue(account);
    prisma.mpesaTransaction.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(transaction);
    prisma.mpesaTransaction.create.mockResolvedValue(transaction);

    const dto: CreateMpesaTransactionDto = {
      businessId: 'biz1',
      mpesaAccountId: 'account1',
      externalTransactionId: 'ext-1',
      amount: 100,
      transactionTime: new Date().toISOString(),
    } as any;

    const first = await service.create(dto);
    const second = await service.create(dto);

    expect(first).toEqual(transaction);
    expect(second).toEqual(transaction);
    expect(prisma.mpesaTransaction.create).toHaveBeenCalledTimes(1);
    expect(second.amount).toEqual(transaction.amount);
  });

  it('denies access to transactions across business boundaries', async () => {
    const txA = { ...transaction, id: 'txA', businessId: 'biz1' };
    const txB = {
      ...transaction,
      id: 'txB',
      businessId: 'biz2',
      mpesaAccountId: 'account2',
      externalTransactionId: 'ext-2',
    };

    prisma.mpesaTransaction.findFirst = jest.fn(({ where }) => {
      if (where.id === 'txA' && where.businessId === 'biz1') {
        return Promise.resolve(txA);
      }
      if (where.id === 'txB' && where.businessId === 'biz2') {
        return Promise.resolve(txB);
      }
      return Promise.resolve(null);
    });

    await expect(service.getById('txB', 'biz1')).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.getById('txA', 'biz2')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects shift attribution for a shift belonging to another business', async () => {
    prisma.business.findUnique.mockResolvedValue(business);
    prisma.mpesaAccount.findFirst.mockResolvedValue(account);
    prisma.shift.findFirst.mockResolvedValue(null);

    const dto: CreateMpesaTransactionDto = {
      businessId: 'biz1',
      mpesaAccountId: 'account1',
      shiftId: 'foreign-shift',
      externalTransactionId: 'ext-1',
      amount: 100,
      transactionTime: new Date().toISOString(),
    } as any;

    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });

  it('preserves existing shift attribution when duplicate transaction is resubmitted with a different shift', async () => {
    const firstTransaction = {
      ...transaction,
      shiftId: 'shift1',
    };

    prisma.business.findUnique.mockResolvedValue(business);
    prisma.mpesaAccount.findFirst.mockResolvedValue(account);
    prisma.shift.findFirst.mockResolvedValueOnce({
      id: 'shift1',
      branchId: 'branch1',
      userId: 'user1',
      openedAt: new Date(),
      closedAt: null,
    });
    prisma.mpesaTransaction.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(firstTransaction);
    prisma.mpesaTransaction.create.mockResolvedValueOnce(firstTransaction);

    const firstDto: CreateMpesaTransactionDto = {
      businessId: 'biz1',
      mpesaAccountId: 'account1',
      shiftId: 'shift1',
      externalTransactionId: 'ext-1',
      amount: 100,
      transactionTime: new Date().toISOString(),
    } as any;

    const secondDto: CreateMpesaTransactionDto = {
      businessId: 'biz1',
      mpesaAccountId: 'account1',
      shiftId: 'shift2',
      externalTransactionId: 'ext-1',
      amount: 100,
      transactionTime: new Date().toISOString(),
    } as any;

    const first = await service.create(firstDto);
    const second = await service.create(secondDto);

    expect(first.shiftId).toEqual('shift1');
    expect(second.shiftId).toEqual('shift1');
    expect(prisma.mpesaTransaction.create).toHaveBeenCalledTimes(1);
  });

  it('updates reconciliation status only and preserves transaction details', async () => {
    const updated = {
      ...transaction,
      status: 'RECONCILED',
    };

    prisma.mpesaTransaction.findFirst.mockResolvedValue(transaction);
    prisma.mpesaTransaction.update = jest.fn().mockResolvedValue(updated);

    const result = await service.update('tx1', 'biz1', {
      status: 'RECONCILED',
    } as any);

    expect(prisma.mpesaTransaction.update).toHaveBeenCalledWith({
      where: { id: 'tx1' },
      data: { status: 'RECONCILED' },
    });
    expect(result).toEqual(updated);
    expect(result.amount).toEqual(transaction.amount);
    expect(result.transactionTime).toEqual(transaction.transactionTime);
    expect(result.externalTransactionId).toEqual(
      transaction.externalTransactionId,
    );
    expect(result.mpesaAccountId).toEqual(transaction.mpesaAccountId);
  });

  it('updates status to DISPUTED without changing immutable fields', async () => {
    const updated = {
      ...transaction,
      status: 'DISPUTED',
    };

    prisma.mpesaTransaction.findFirst.mockResolvedValue(transaction);
    prisma.mpesaTransaction.update = jest.fn().mockResolvedValue(updated);

    const result = await service.update('tx1', 'biz1', {
      status: 'DISPUTED',
    } as any);

    expect(prisma.mpesaTransaction.update).toHaveBeenCalledWith({
      where: { id: 'tx1' },
      data: { status: 'DISPUTED' },
    });
    expect(result.status).toEqual('DISPUTED');
    expect(result.amount).toEqual(transaction.amount);
    expect(result.transactionTime).toEqual(transaction.transactionTime);
    expect(result.externalTransactionId).toEqual(
      transaction.externalTransactionId,
    );
    expect(result.mpesaAccountId).toEqual(transaction.mpesaAccountId);
  });

  it('throws NotFoundException when updating reconciliation status for wrong business', async () => {
    prisma.mpesaTransaction.findFirst.mockResolvedValue(null);

    await expect(
      service.update('tx1', 'biz2', {
        status: 'RECONCILED',
      } as any),
    ).rejects.toThrow(NotFoundException);
  });
});
