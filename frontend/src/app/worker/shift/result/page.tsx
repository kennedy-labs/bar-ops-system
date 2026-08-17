'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/api';

export default function ShiftResult() {
  const { data, isLoading } = useQuery({
    queryKey: ['shiftResult'],
    queryFn: async () => {
      const response = await api.get('/reports/summary');
      return response.data;
    },
  });

  if (isLoading) return <div>Calculating shift results...</div>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Shift Closed Successfully</h1>
      <pre className="bg-gray-100 p-4 mt-4">{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
