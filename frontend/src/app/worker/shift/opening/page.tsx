"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api/api";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OpeningStockVerification() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["openingStock"],
    queryFn: async () => {
      const response = await api.get("/inventory-items");
      return response.data;
    },
  });

  const [counts, setCounts] = useState<Record<string, number>>({});

  const startShiftMutation = useMutation({
    mutationFn: async (payload: any) => {
      // We'll call the shift opening logic here
      return await api.post("/shifts/open", payload);
    },
    onSuccess: () => {
      router.push("/worker/shift/active");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Translate the worker's manual counts into the backend format
    const verificationData = Object.entries(counts).map(
      ([itemId, quantity]) => ({
        inventoryItemId: itemId,
        actualQuantity: quantity,
      }),
    );

    startShiftMutation.mutate({ items: verificationData });
  };

  if (isLoading) return <div>Loading opening inventory...</div>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Opening Stock Verification</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {data.map((item: any) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-2 border rounded"
          >
            <span>
              {item.product.name} (Exp: {item.quantity})
            </span>
            <input
              type="number"
              placeholder="Counted"
              className="border p-1 w-20"
              onChange={(e) =>
                setCounts({ ...counts, [item.id]: parseInt(e.target.value) })
              }
            />
          </div>
        ))}
        <button
          type="submit"
          className="bg-green-600 text-white p-2 rounded w-full"
        >
          Verify and Start Shift
        </button>
      </form>
    </main>
  );
}
