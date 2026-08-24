'use client';
export const dynamic = "force-dynamic";
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api/api';
import { useRouter } from 'next/navigation';

export default function ClosingShift() {
  const router = useRouter();
  
  const closeShift = useMutation({
    mutationFn: () => api.post('/shifts/close'),
    onSuccess: () => router.push('/worker/shift/result')
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Closing Procedure</h1>
      <p>Please enter your final physical stock counts.</p>
      
      <button 
        onClick={() => closeShift.mutate()}
        className="w-full bg-purple-700 text-white p-4 rounded font-bold"
      >
        FINALIZE & CLOSE SHIFT
      </button>
    </section>
  );
}
