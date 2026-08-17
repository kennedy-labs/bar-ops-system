export interface SalesReportItem {
  productId: string;
  productName: string;
  totalSold: number;
}

export interface SalesReport {
  items: SalesReportItem[];
  generatedAt: Date;
}
