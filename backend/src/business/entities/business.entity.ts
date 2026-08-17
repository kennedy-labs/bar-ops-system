export interface Business {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  currency: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}
