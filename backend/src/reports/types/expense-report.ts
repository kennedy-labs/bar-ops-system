export interface ExpenseReportItem {
  id: string;
  amount: number;
  description: string;
  branchName: string;
  createdAt: Date;
}

export interface ExpenseReport {
  items: ExpenseReportItem[];
  totalExpenses: number;
  generatedAt: Date;
}
