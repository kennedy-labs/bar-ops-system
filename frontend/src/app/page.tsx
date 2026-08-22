import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50 p-4">
      <LoginForm />
    </main>
  );
}
