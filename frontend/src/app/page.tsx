import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <LoginForm />
    </main>
  );
}
