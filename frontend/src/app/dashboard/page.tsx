'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRedirect() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (user.role === 'OWNER') {
      router.push('/owner/dashboard');
    } else {
      router.push('/worker/shift');
    }
  }, [user, router]);

  return <div className="p-4">Loading your workspace...</div>;
}
