"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/api";
import { useAuthStore } from "@/store/useAuthStore";
import OwnerLayout from "@/app/owner/layout";
import { useState } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export type User = {
  id: string;
  name: string;
  phone: string;
  role: "OWNER" | "MANAGER" | "WORKER";
  active: boolean;
};

export type Business = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
};

export default function OwnerManagement() {
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const businessId = user?.businessId as string | undefined;
  const userId = user?.id as string | undefined;
  const curBiz = user?.businessName || businessId?.slice(0, 8) || "Current Business";
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users, isLoading: ul } = useQuery({
    queryKey: ["users", businessId],
    queryFn: async () =>
      (await api.get("/users", { params: { businessId } })).data as User[],
    enabled: !!businessId,
  });

  const { data: businesses } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => (await api.get("/businesses")).data as Business[],
  });

  const mu = useMutation({ mutationFn: async (p: any) => (await api.post("/users", p)).data, onSuccess: () => { qc.invalidateQueries({ queryKey: ["users", businessId] }); setShowAddUser(false); } });
  const muPatch = useMutation({ mutationFn: async ({ id, ...body }: { id: string; role?: string; active?: boolean; name?: string; phone?: string }) => (await api.patch(`/users/${id}`, body)).data, onSuccess: () => { qc.invalidateQueries({ queryKey: ["users", businessId] }); setEditingUser(null); } });
  const muDel = useMutation({ mutationFn: async (id: string) => { await api.delete(`/users/${id}`); return id; }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["users", businessId] }); } });
  const muBiz = useMutation({ mutationFn: async (p: any) => (await api.post("/businesses", p)).data, onSuccess: () => { qc.invalidateQueries({ queryKey: ["businesses"] }); setShowAddBusiness(false); } });

  if (!businessId)
    return (
      <OwnerLayout>
        <main className="p-6"><p>Loading...</p></main>
      </OwnerLayout>
    );

  return (
    <OwnerLayout>
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold">Owner Management</h1><p className="text-gray-600 mt-1">Managing: {curBiz}</p></div>
          <button onClick={() => setShowAddBusiness(true)} className="bg-indigo-600 text-white px-4 py-2 rounded">+ Add Business</button>
        </div>

        {businesses && (
          <select value={businessId} onChange={(e) => { const biz = businesses.find((b) => b.id === e.target.value); if (biz) { const t = useAuthStore.getState().token ?? ""; useAuthStore.getState().setAuth(t, { ...user, businessId: biz.id, businessName: biz.name }); qc.invalidateQueries({ queryKey: ["users", biz.id] }); router.refresh(); } }} className="border p-2 rounded mb-6">
            {businesses.map((biz) => <option key={biz.id} value={biz.id}>{biz.name}</option>)}
          </select>
        )}

        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">People</h2>
            <button onClick={() => setShowAddUser(true)} className="bg-green-600 text-white px-3 py-1 rounded">+ Add User</button>
          </div>
          {ul ? <p>Loading users...</p> : !users?.length ? <p className="text-gray-500">No users yet.</p> : (
            <table className="min-w-full bg-white rounded shadow">
              <thead><tr className="bg-gray-100"><th className="p-3 text-left">Name</th><th className="p-3 text-left">Phone</th><th className="p-3 text-left">Role</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
              <tbody>
                {users.map((u: User) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.phone || "—"}</td>
                    <td className="p-3 capitalize">{u.role.toLowerCase()}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${u.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{u.active ? "Active" : "Inactive"}</span></td>
                    <td className="p-3 text-right space-x-1">
                      <button onClick={() => setEditingUser(u)} className="text-blue-600">✎</button>
                      <button onClick={() => { if (confirm(`Deactivate ${u.name}?`)) muDel.mutate(u.id); }} className="text-red-600">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {showAddUser && <UserForm bizId={businessId} onSuccess={() => setShowAddUser(false)} />}
        {showAddBusiness && <BusinessForm onSuccess={() => setShowAddBusiness(false)} afterCreate={(nb: Business) => { const t = useAuthStore.getState().token ?? ""; useAuthStore.getState().setAuth(t, { ...user, businessId: nb.id, businessName: nb.name }); }} />}
        {editingUser && <UserForm editing={editingUser} onSuccess={() => setEditingUser(null)} />}
      </main>
    </OwnerLayout>
  );
}

function UserForm({ bizId, editing, onSuccess }: { bizId?: string; editing?: User; onSuccess: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(editing?.name ?? "");
  const [phone, setPhone] = useState(editing?.phone ?? "");
  const [role, setRole] = useState<"OWNER" | "MANAGER" | "WORKER">(editing?.role ?? "WORKER");
  const [password, setPassword] = useState("");
  const isEdit = !!editing;

  const handleSubmit = () => {
    if (!name || !phone) return alert("Name and phone required.");
    const payload = isEdit
      ? { name, phone, role }
      : { name, phone, role, password, businessId: bizId };
    const req = isEdit
      ? api.patch(`/users/${editing!.id}`, payload)
      : api.post("/users", payload);
    req
      .then(() => {
        qc.invalidateQueries({ queryKey: ["users"] });
        onSuccess();
      })
      .catch((e: any) => alert(e?.response?.data?.message || "Failed"));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-md mx-2">
        <h3 className="font-bold mb-4">{isEdit ? "Edit User" : "Add User"}</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="border p-2 rounded w-full mb-2" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="border p-2 rounded w-full mb-2" />
        <select value={role} onChange={(e) => setRole(e.target.value as User["role"])} className="border p-2 rounded w-full mb-2">
          <option value="WORKER">Worker</option>
          <option value="MANAGER">Manager</option>
          <option value="OWNER">Owner</option>
        </select>
        {!isEdit && (
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Temp Password" type="password" className="border p-2 rounded w-full mb-2" />
        )}
        <div className="flex gap-2">
          <button onClick={handleSubmit} className="flex-1 bg-green-600 text-white p-2 rounded">{isEdit ? "Save" : "Add"}</button>
          <button onClick={onSuccess} className="flex-1 bg-gray-300 p-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function BusinessForm({ onSuccess, afterCreate }: { onSuccess: () => void; afterCreate: (b: Business) => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = () => {
    if (!name) return alert("Business name required.");
    api
      .post("/businesses", { name, phone: phone || undefined })
      .then((resp: any) => {
        const nb: Business = resp.data;
        afterCreate(nb);
        qc.invalidateQueries({ queryKey: ["businesses"] });
        onSuccess();
      })
      .catch((e: any) => alert(e?.response?.data?.message || "Failed"));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-md mx-2">
        <h3 className="font-bold mb-4">Add Business</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Business Name" className="border p-2 rounded w-full mb-2" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="border p-2 rounded w-full mb-2" />
        <div className="flex gap-2">
          <button onClick={handleSubmit} className="flex-1 bg-indigo-600 text-white p-2 rounded">Create</button>
          <button onClick={onSuccess} className="flex-1 bg-gray-300 p-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}