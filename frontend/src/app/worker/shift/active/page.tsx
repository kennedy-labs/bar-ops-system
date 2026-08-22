'use client';
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';

export default function ActiveOperations() {
  const router = useRouter();
  
  const recordSale = useMutation({
    mutationFn: (data: any) => api.post('/stock-movements', { ...data, type: 'SHIFT_ADDITION' }),
  });

  const recordExpense = useMutation({
    mutationFn: (data: any) => api.post('/expenses', data),
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Shift Operations</h1>
      
      <section className="p-4 border rounded">
        <h2 className="font-bold">Record Sale</h2>
        {/* Simplified Sale Entry Form */}
        <button onClick={() => recordSale.mutate({})} className="bg-blue-500 text-white p-2 rounded mt-2">Record Sale</button>
      </section>

      <section className="p-4 border rounded">
        <h2 className="font-bold">Record Expense</h2>
        <button onClick={() => recordExpense.mutate({})} className="bg-orange-500 text-white p-2 rounded mt-2">Record Expense</button>
      </section>

      <button 
        onClick={() => router.push('/worker/shift/closing')}
        className="w-full bg-red-600 text-white p-4 rounded font-bold"
      >
        GO TO CLOSING
      </button>
    </main>
  );
}
