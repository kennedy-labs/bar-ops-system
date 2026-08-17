export interface DiscrepancyReportItem {
  id: string;
  type: string;
  status: string;
  variance: number;
  sourceReference: string;
}

export interface DiscrepancyReport {
  items: DiscrepancyReportItem[];
  generatedAt: Date;
}
