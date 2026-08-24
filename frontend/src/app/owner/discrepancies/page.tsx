"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/api";
import { useAuthStore } from "@/store/useAuthStore";
import OwnerLayout from "@/app/owner/layout";
import { useState } from "react";

export const dynamic = "force-dynamic";

type Discrepancy = {
  id: string;
  type:
    | "STOCK_SHORTAGE"
    | "CASH_SHORTAGE"
    | "MPESA_MISMATCH"
    | "TRANSFER_MISMATCH"
    | "UNCONFIRMED_ADDITION";
  description?: string;
  expectedValue: number | string;
  actualValue: number | string;
  variance: number | string;
  status: "OPEN" | "RESOLVED";
  resolution?: string;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  STOCK_SHORTAGE: "Stock Shortage",
  CASH_SHORTAGE: "Cash Shortage",
  MPESA_MISMATCH: "M-Pesa Mismatch",
  TRANSFER_MISMATCH: "Transfer Mismatch",
  UNCONFIRMED_ADDITION: "Unconfirmed Addition",
};

export default function OwnerDiscrepancies() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const businessId = user?.businessId as string | undefined;
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
  const enabled = !!businessId;

  const { data: items, isLoading } = useQuery({
    queryKey: ["discrepancies", businessId],
    queryFn: async () =>
      (await api.get("/discrepancies", { params: { businessId } }))
        .data as Discrepancy[],
    enabled,
  });

  const resolve = useMutation({
    mutationFn: async ({ id, resolution }: { id: string; resolution: string }) =>
      (
        await api.post(`/discrepancies/${id}/resolve`, { resolution }, {
          params: { businessId },
        })
      ).data,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["discrepancies", businessId] }),
  });

  const list = (items ?? []).filter((d) =>
    filter === "ALL" ? true : d.status === filter,
  );
  const openCount = (items ?? []).filter((d) => d.status === "OPEN").length;
  const resolvedCount = (items ?? []).filter((d) => d.status === "RESOLVED").length;

  if (!businessId)
    return (
      <OwnerLayout>
        <main className="p-6"><p>Loading...</p></main>
      </OwnerLayout>
    );

  return (
    <OwnerLayout>
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6">Discrepancies</h1>

        {/* Summary chips */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setFilter("ALL")} className={`px-4 py-2 rounded text-sm font-medium ${filter === "ALL" ? "bg-slate-900 text-white" : "bg-white border"}`}>
            All ({(items ?? []).length})
          </button>
          <button onClick={() => setFilter("OPEN")} className={`px-4 py-2 rounded text-sm font-medium ${filter === "OPEN" ? "bg-red-600 text-white" : "bg-white border"}`}>
            Open ({openCount})
          </button>
          <button onClick={() => setFilter("RESOLVED")} className={`px-4 py-2 rounded text-sm font-medium ${filter === "RESOLVED" ? "bg-green-600 text-white" : "bg-white border"}`}>
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* List */}
        {isLoading ? <p>Loading discrepancies...</p> : !list.length ? (
          <p className="text-gray-500">
            {filter === "ALL" ? "No discrepancies recorded. Clean operation!" : `No ${filter.toLowerCase()} discrepancies.`}
          </p>
        ) : (
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-right">Expected</th>
                <th className="p-3 text-right">Actual</th>
                <th className="p-3 text-right">Variance</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="p-3 text-sm font-medium">{TYPE_LABELS[d.type] ?? d.type}</td>
                  <td className="p-3 text-sm">{d.description || "—"}</td>
                  <td className="p-3 text-right text-sm">{Number(d.expectedValue).toLocaleString()}</td>
                  <td className="p-3 text-right text-sm">{Number(d.actualValue).toLocaleString()}</td>
                  <td className={`p-3 text-right text-sm font-semibold ${Number(d.variance) < 0 ? "text-red-600" : "text-orange-600"}`}>
                    {Number(d.variance) > 0 ? "+" : ""}{Number(d.variance).toLocaleString()}
                  </td>
                  <td className="p-3 text-xs">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${d.status === "RESOLVED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{d.status}</span></td>
                  <td className="p-3 text-right">
                    {d.status === "OPEN" && (
                      <button
                        onClick={() => {
                          const res = prompt(`Resolution for "${TYPE_LABELS[d.type]}":`);
                          if (res && res.trim()) resolve.mutate({ id: d.id, resolution: res.trim() });
                        }}
                        className="text-green-600 font-medium"
                      >
                        Resolve
                      </button>
                    )}
                    {d.status === "RESOLVED" && d.resolution && (
                      <span className="text-xs text-gray-500 italic" title={d.resolution}>note ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </OwnerLayout>
  );
}