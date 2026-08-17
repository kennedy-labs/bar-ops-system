export interface MpesaReportItem {
  id: string;
  amount: number;
  transactionTime: Date;
  status: string;
  accountName: string;
}

export interface MpesaReport {
  items: MpesaReportItem[];
  totalReceived: number;
  generatedAt: Date;
}
