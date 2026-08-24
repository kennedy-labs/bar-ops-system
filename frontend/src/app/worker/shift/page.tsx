"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/api";

export const dynamic = "force-dynamic";

export default function WorkerShift() {
  const { data, isLoading } = useQuery({
    queryKey: ["shiftStatus"],
    queryFn: async () => {
      const response = await api.get("/shifts/status");
      return response.data;
    },
  });

  if (isLoading) return <div>Loading shift status...</div>;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Worker Shift</h1>
      {data?.isActive ? (
        <p>Shift in progress. <a href="/worker/shift/closing" className="text-blue-600">Go to closing</a></p>
      ) : (
        <p>Please begin your shift opening procedure. <a href="/worker/shift/opening" className="text-blue-600">Start here</a></p>
      )}
    </section>
  );
}
