import { Test, TestingModule } from '@nestjs/testing';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';

describe('TransfersController', () => {
  let controller: TransfersController;
  let service: TransfersService;

  const mockTransfersService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    addItems: jest.fn(),
    dispatch: jest.fn(),
    receive: jest.fn(),
    getDiscrepancies: jest.fn(),
    getStockMovements: jest.fn(),
    getByBranch: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransfersController],
      providers: [
        {
          provide: TransfersService,
          useValue: mockTransfersService,
        },
      ],
    }).compile();

    controller = module.get<TransfersController>(TransfersController);
    service = module.get<TransfersService>(TransfersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /transfers', () => {
    it('should return all transfers', async () => {
      const expectedTransfers = [{ id: '1' }, { id: '2' }];
      mockTransfersService.getAll.mockResolvedValue(expectedTransfers);

      const result = await controller.getAll();

      expect(result).toEqual(expectedTransfers);
      expect(mockTransfersService.getAll).toHaveBeenCalled();
    });
  });

  describe('GET /transfers/:id', () => {
    it('should return a transfer by ID', async () => {
      const expectedTransfer = { id: '1' };
      mockTransfersService.getById.mockResolvedValue(expectedTransfer);

      const result = await controller.getById('1');

      expect(result).toEqual(expectedTransfer);
      expect(mockTransfersService.getById).toHaveBeenCalledWith('1');
    });
  });

  describe('POST /transfers', () => {
    it('should create a transfer request', async () => {
      const dto = {
        businessId: 'biz1',
        senderBranchId: 'branch1',
        receiverBranchId: 'branch2',
        senderUserId: 'user1',
      };
      const expectedTransfer = { id: '1', ...dto };
      mockTransfersService.create.mockResolvedValue(expectedTransfer);

      const result = await controller.create(dto);

      expect(result).toEqual(expectedTransfer);
      expect(mockTransfersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('POST /transfers/:id/items', () => {
    it('should add items to a pending transfer', async () => {
      const dto = {
        items: [{ productId: 'p1', productUnitId: 'u1', quantity: 10 }],
      };
      mockTransfersService.addItems.mockResolvedValue({ count: 1 });

      const result = await controller.addItems('1', dto);

      expect(result).toEqual({ count: 1 });
      expect(mockTransfersService.addItems).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('POST /transfers/:id/dispatch', () => {
    it('should dispatch a transfer', async () => {
      const dto = { userId: 'user1' };
      mockTransfersService.dispatch.mockResolvedValue({
        id: '1',
        status: 'SENDER_CONFIRMED',
      });

      const result = await controller.dispatch('1', dto);

      expect(result).toEqual({ id: '1', status: 'SENDER_CONFIRMED' });
      expect(mockTransfersService.dispatch).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('POST /transfers/:id/receive', () => {
    it('should receive a transfer', async () => {
      const dto = { userId: 'user2' };
      mockTransfersService.receive.mockResolvedValue({
        id: '1',
        status: 'COMPLETED',
      });

      const result = await controller.receive('1', dto);

      expect(result).toEqual({ id: '1', status: 'COMPLETED' });
      expect(mockTransfersService.receive).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('GET /transfers/:id/discrepancies', () => {
    it('should get discrepancies for a transfer', async () => {
      const expected = [{ id: 'd1' }];
      mockTransfersService.getDiscrepancies.mockResolvedValue(expected);

      const result = await controller.getDiscrepancies('1');

      expect(result).toEqual(expected);
      expect(mockTransfersService.getDiscrepancies).toHaveBeenCalledWith('1');
    });
  });

  describe('GET /transfers/:id/stock-movements', () => {
    it('should get stock movements for a transfer', async () => {
      const expected = [{ id: 'sm1' }];
      mockTransfersService.getStockMovements.mockResolvedValue(expected);

      const result = await controller.getStockMovements('1');

      expect(result).toEqual(expected);
      expect(mockTransfersService.getStockMovements).toHaveBeenCalledWith('1');
    });
  });

  describe('GET /transfers/by-branch/:branchId', () => {
    it('should return transfers for a specific branch', async () => {
      const expected = [{ id: '1' }];
      mockTransfersService.getByBranch.mockResolvedValue(expected);

      const result = await controller.getByBranch('branch1', 'SENDER');

      expect(result).toEqual(expected);
      expect(mockTransfersService.getByBranch).toHaveBeenCalledWith(
        'branch1',
        'SENDER',
      );
    });
  });
});
