'use client';
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api/api';
import { useAuthStore } from '@/store/useAuthStore';

const TABS = [
  { id: 'mpesa', label: 'Mpesa' },
  { id: 'expense', label: 'Expense' },
  { id: 'stock', label: 'Stock' },
];

export default function ActiveOperations() {
  const user = useAuthStore((state) => state.user);
  const businessId = user?.businessId as string | undefined;

  const [tab, setTab] = useState('mpesa');

  const enabled = typeof window !== 'undefined' && !!businessId;

  const accounts = useQuery({
    queryKey: ['mpesaAccounts', businessId],
    queryFn: async () => (await api.get('/mpesa-accounts', { params: { businessId } })).data,
    enabled,
  });
  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: async () => (await api.get('/branches')).data,
    enabled,
  });
  const shifts = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => (await api.get('/shifts')).data,
    enabled,
  });
  const products = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await api.get('/products')).data,
    enabled,
  });
  const units = useQuery({
    queryKey: ['productUnits'],
    queryFn: async () => (await api.get('/product-units')).data,
    enabled,
  });
  const locations = useQuery({
    queryKey: ['stockLocations'],
    queryFn: async () => (await api.get('/stock-locations')).data,
    enabled,
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Shift Operations</h1>
      <div className="flex gap-2 border-b pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md font-medium ${
              tab === t.id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'mpesa' && (
        <MpesaForm businessId={businessId} accounts={accounts.data} shifts={shifts.data} isLoading={accounts.isLoading || shifts.isLoading} />
      )}
      {tab === 'expense' && (
        <ExpenseForm businessId={businessId} branches={branches.data} userId={user?.id} isLoading={branches.isLoading} />
      )}
      {tab === 'stock' && (
        <StockForm businessId={businessId} branches={branches.data} products={products.data} units={units.data} locations={locations.data} shifts={shifts.data} />
      )}
    </section>
  );
}

// --- MpesaForm ---
function MpesaForm({ businessId, accounts, shifts, isLoading }: { businessId?: string; accounts?: any[]; shifts?: any[]; isLoading: boolean }) {
  const [show, setShow] = useState(false);
  const form = new FormData();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    await api.post('/mpesa-transactions', { businessId, amount: Number(fd.get('amount')), accountId: fd.get('accountId'), reference: fd.get('reference'), phone: fd.get('phone') });
    (e.target as any).reset();
  };
  if (isLoading) return <p>Loading accounts…</p>;
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="amount" type="number" step="0.01" placeholder="Amount" className="border p-2 rounded w-full" required />
      <select name="accountId" className="border p-2 rounded w-full" required>
        {accounts?.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>) || <option value="">No accounts</option>}
      </select>
      <input name="reference" placeholder="Reference / Receipt No" className="border p-2 rounded w-full" />
      <input name="phone" placeholder="Phone number" className="border p-2 rounded w-full" />
      <button type="submit" className="bg-indigo-600 text-white p-2 rounded w-full">Record Mpesa</button>
    </form>
  );
}

// --- ExpenseForm ---
function ExpenseForm({ businessId, branches, userId, isLoading }: { businessId?: string; branches?: any[]; userId?: string; isLoading: boolean }) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    await api.post('/expenses', { businessId, amount: Number(fd.get('amount')), category: fd.get('category'), description: fd.get('description'), branchId: fd.get('branchId'), recordedById: userId });
    (e.target as any).reset();
  };
  if (isLoading) return <p>Loading branches…</p>;
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="amount" type="number" step="0.01" placeholder="Amount" className="border p-2 rounded w-full" required />
      <select name="category" className="border p-2 rounded w-full">
        <option value="STOCK">Stock</option><option value="OPERATING">Operating</option><option value="WAGE">Wage</option><option value="OTHER">Other</option>
      </select>
      <input name="description" placeholder="Description" className="border p-2 rounded w-full" />
      <select name="branchId" className="border p-2 rounded w-full">
        {branches?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>) || <option value="">No branches</option>}
      </select>
      <button type="submit" className="bg-indigo-600 text-white p-2 rounded w-full">Record Expense</button>
    </form>
  );
}

// --- StockForm ---
function StockForm({ businessId, branches, products, units, locations, shifts }: { businessId?: string; branches?: any[]; products?: any[]; units?: any[]; locations?: any[]; shifts?: any[] }) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    await api.post('/inventory-items', { businessId, productId: fd.get('productId'), actualQuantity: Number(fd.get('quantity')), type: fd.get('type'), reason: fd.get('reason'), unitId: fd.get('unitId'), locationId: fd.get('locationId'), branchId: fd.get('branchId'), shiftId: fd.get('shiftId') });
    (e.target as any).reset();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select name="productId" className="border p-2 rounded w-full" required>
        {products?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>) || <option value="">Loading...</option>}
      </select>
      <input name="quantity" type="number" placeholder="Quantity" className="border p-2 rounded w-full" required />
      <select name="type" className="border p-2 rounded w-full">
        <option value="SUPPLIER_DELIVERY">Delivery</option><option value="DAMAGE">Damage</option><option value="TRANSFER_IN">Transfer In</option><option value="TRANSFER_OUT">Transfer Out</option><option value="ADJUSTMENT">Adjustment</option>
      </select>
      <input name="reason" placeholder="Reason" className="border p-2 rounded w-full" />
      <select name="unitId" className="border p-2 rounded w-full">
        {units?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>) || <option value="">No units</option>}
      </select>
      <select name="locationId" className="border p-2 rounded w-full">
        {locations?.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>) || <option value="">No locations</option>}
      </select>
      <select name="branchId" className="border p-2 rounded w-full">
        {branches?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>) || <option value="">No branches</option>}
      </select>
      <select name="shiftId" className="border p-2 rounded w-full">
        <option value="">No active shift</option>
        {shifts?.filter((s: any) => !s.closedAt)?.map((s: any) => <option key={s.id} value={s.id}>Shift {s.id.slice(0, 8)}</option>)}
      </select>
      <button type="submit" className="bg-indigo-600 text-white p-2 rounded w-full">Record Stock</button>
    </form>
  );
}
