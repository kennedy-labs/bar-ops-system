"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/api";

export default function OwnerDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["businessSummary"],
    queryFn: async () => {
      const response = await api.get("/reports/summary");
      return response.data;
    },
    // This page is authenticated and fetches after login in the browser.
    // Do not run the fetch during server-side static export (Vercel build).
    enabled: typeof window !== "undefined",
  });

  if (isLoading || !data) return <div>Loading dashboard...</div>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Business Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="p-4 bg-blue-100 rounded">
          <h2 className="font-bold">Total Revenue</h2>
          <p className="text-xl">KES {data?.revenue || 0}</p>
        </div>
        <div className="p-4 bg-red-100 rounded">
          <h2 className="font-bold">Total Expenses</h2>
          <p className="text-xl">KES {data?.expenses || 0}</p>
        </div>
        <div className="p-4 bg-green-100 rounded">
          <h2 className="font-bold">Net Profit</h2>
          <p className="text-xl">KES {data?.net || 0}</p>
        </div>
      </div>
    </main>
  );
}
