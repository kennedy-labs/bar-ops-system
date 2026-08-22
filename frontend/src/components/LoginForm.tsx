'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Auto-login on mount (security disabled for development)
  useEffect(() => {
    const fakeToken = 'demo-token-' + Date.now();
    const fakeUser = {
      id: 'demo-user-1',
      name: 'worker1',
      businessId: 'joypub',
      role: 'WORKER',
    };
    setAuth(fakeToken, fakeUser);
    router.push('/dashboard');
  }, [setAuth, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50 p-4">
      <div className="text-center">
        <div className="text-2xl font-bold mb-2">Bar Ops System</div>
        <div className="text-gray-500">Redirecting to dashboard...</div>
      </div>
    </div>
  );
}

