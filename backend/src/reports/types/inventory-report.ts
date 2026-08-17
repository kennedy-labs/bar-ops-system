export interface InventoryReportItem {
  productId: string;
  productName: string;
  quantity: number;
  stockLocation: string;
}

export interface InventoryReport {
  items: InventoryReportItem[];
  generatedAt: Date;
}
