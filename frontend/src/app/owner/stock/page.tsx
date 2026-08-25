"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";

export const dynamic = "force-dynamic";

type Product = {
  id: string;
  name: string;
  sellingPrice: number;
};

type InventoryItem = {
  id: string;
  quantity: number;
  product: { id: string; name: string };
};

type StockLocation = {
  id: string;
  name: string;
  type: "COUNTER" | "STORAGE";
};

type Branch = { id: string; name: string };

export default function OwnerStock() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const businessId = user?.businessId as string | undefined;
  const [showAddProduct, setShowAddProduct] = useState(false);
  const enabled = !!businessId;

  const { data: products, isLoading: lp } = useQuery({
    queryKey: ["products", businessId],
    queryFn: async () =>
      (await api.get("/products", { params: { businessId } })).data as Product[],
    enabled,
  });

  const { data: inventory, isLoading: li } = useQuery({
    queryKey: ["inventoryItems", businessId],
    queryFn: async () =>
      (await api.get("/inventory-items")).data as InventoryItem[],
    enabled,
  });

  const { data: locations, isLoading: ll } = useQuery({
    queryKey: ["stockLocations", businessId],
    queryFn: async () =>
      (await api.get("/stock-locations")).data as StockLocation[],
    enabled,
  });

  const { data: branches } = useQuery({
    queryKey: ["branches", businessId],
    queryFn: async () =>
      (await api.get("/branches", { params: { businessId } })).data as Branch[],
    enabled,
  });

  const totalUnits = (inventory ?? []).reduce((s, i) => s + Number(i.quantity), 0);

  if (!businessId)
    return <main className="p-6"><p>Loading...</p></main>;

  return (
    <>
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Stock</h1>
          <div className="space-x-2">
            <button onClick={() => setShowAddProduct(true)} className="bg-green-600 text-white px-4 py-2 rounded">+ Add Product</button>
          </div>
        </div>

        {/* Products */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Products</h2>
          {lp ? <p>Loading products...</p> : !products?.length ? (
            <p className="text-gray-500">No products yet. Add your first product above.</p>
          ) : (
            <table className="min-w-full bg-white rounded shadow">
              <thead><tr className="bg-gray-100"><th className="p-3 text-left">Name</th><th className="p-3 text-right">Selling Price</th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">{p.name}</td>
                    <td className="p-3 text-right font-semibold">KES {Number(p.sellingPrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Inventory */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Inventory Levels</h2>
            <p className="font-semibold">Total units: {totalUnits.toLocaleString()}</p>
          </div>
          {li ? <p>Loading inventory...</p> : !inventory?.length ? (
            <p className="text-gray-500">No inventory items recorded yet.</p>
          ) : (
            <table className="min-w-full bg-white rounded shadow">
              <thead><tr className="bg-gray-100"><th className="p-3 text-left">Product</th><th className="p-3 text-right">Quantity</th></tr></thead>
              <tbody>
                {inventory.map((i) => (
                  <tr key={i.id} className="border-t">
                    <td className="p-3">{i.product?.name ?? i.id.slice(0, 8)}</td>
                    <td className={`p-3 text-right font-semibold ${Number(i.quantity) <= 0 ? "text-red-600" : ""}`}>{Number(i.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Stock Locations */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Stock Locations</h2>
          {ll ? <p>Loading locations...</p> : !locations?.length ? (
            <p className="text-gray-500">No stock locations yet.</p>
          ) : (
            <table className="min-w-full bg-white rounded shadow">
              <thead><tr className="bg-gray-100"><th className="p-3 text-left">Name</th><th className="p-3 text-left">Type</th></tr></thead>
              <tbody>
                {locations.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="p-3">{l.name}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${l.type === "COUNTER" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>{l.type}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {showAddProduct && <AddProductModal businessId={businessId} branches={branches ?? []} onClose={() => setShowAddProduct(false)} />}
      </main>
    </>
  );
}

function AddProductModal({ businessId, branches, onClose }: { businessId: string; branches: Branch[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  // Optional location (created together with the product)
  const [locName, setLocName] = useState("");
  const [locType, setLocType] = useState<"COUNTER" | "STORAGE">("COUNTER");
  const [locBranchId, setLocBranchId] = useState(branches[0]?.id ?? "");

  const handleSubmit = async () => {
    if (!name || !price || Number(price) <= 0) return alert("Enter a product name and a positive price.");
    try {
      if (locName) {
        await api.post("/stock-locations", {
          branchId: locBranchId || branches[0]?.id,
          name: locName,
          type: locType,
        });
        qc.invalidateQueries({ queryKey: ["stockLocations"] });
      }
      await api.post("/products", { name, sellingPrice: Number(price), businessId });
      qc.invalidateQueries({ queryKey: ["products", businessId] });
      onClose();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to save");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-md mx-2">
        <h3 className="font-bold mb-4">Add Product</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name (e.g. Tusker 500ml)" className="border p-2 rounded w-full mb-2" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" placeholder="Selling Price (KES)" className="border p-2 rounded w-full mb-2" />

        <hr className="my-3" />
        <p className="text-sm text-gray-600 mb-2">Optional — also create a stock location for this product:</p>
        <input value={locName} onChange={(e) => setLocName(e.target.value)} placeholder="Location Name (e.g. Main Counter)" className="border p-2 rounded w-full mb-2" />
        <select value={locType} onChange={(e) => setLocType(e.target.value as "COUNTER" | "STORAGE")} className="border p-2 rounded w-full mb-2">
          <option value="COUNTER">Counter</option>
          <option value="STORAGE">Storage</option>
        </select>
        <select value={locBranchId} onChange={(e) => setLocBranchId(e.target.value)} className="border p-2 rounded w-full mb-2">
          {branches.length ? branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>) : <option value="">No branches available</option>}
        </select>

        <div className="flex gap-2">
          <button onClick={handleSubmit} className="flex-1 bg-green-600 text-white p-2 rounded">Create</button>
          <button onClick={onClose} className="flex-1 bg-gray-300 p-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}

