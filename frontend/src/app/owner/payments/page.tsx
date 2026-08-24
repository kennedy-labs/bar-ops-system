"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/api";
import { useAuthStore } from "@/store/useAuthStore";
import OwnerLayout from "@/app/owner/layout";
import { useState } from "react";

export const dynamic = "force-dynamic";

type MpesaAccount = {
  id: string;
  accountIdentifier: string;
  displayName: string;
  status: "ACTIVE" | "INACTIVE";
};

type MpesaTransaction = {
  id: string;
  mpesaAccountId: string;
  externalTransactionId: string;
  amount: number | string;
  transactionTime: string;
  status: "RECEIVED" | "RECONCILED" | "DISPUTED";
};

export default function OwnerPayments() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const businessId = user?.businessId as string | undefined;
  const [showAddAccount, setShowAddAccount] = useState(false);
  const enabled = !!businessId;

  const { data: accounts, isLoading: la } = useQuery({
    queryKey: ["mpesaAccounts", businessId],
    queryFn: async () =>
      (await api.get("/mpesa-accounts", { params: { businessId } })).data as MpesaAccount[],
    enabled,
  });

  const { data: txs, isLoading: lt } = useQuery({
    queryKey: ["mpesaTransactions", businessId],
    queryFn: async () =>
      (await api.get("/mpesa-transactions", { params: { businessId } })).data as MpesaTransaction[],
    enabled,
  });

  const deactivate = useMutation({
    mutationFn: async (id: string) =>
      (await api.post(`/mpesa-accounts/${id}/deactivate`, null, { params: { businessId } })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mpesaAccounts", businessId] }),
  });

  const totalReceived = (txs ?? []).reduce((sum, t) => sum + Number(t.amount), 0);

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
          <h1 className="text-3xl font-bold">Payments</h1>
          <button onClick={() => setShowAddAccount(true)} className="bg-indigo-600 text-white px-4 py-2 rounded">+ Add M-Pesa Account</button>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">M-Pesa Accounts</h2>
          {la ? <p>Loading accounts...</p> : !accounts?.length ? (
            <p className="text-gray-500">No M-Pesa accounts yet.</p>
          ) : (
            <table className="min-w-full bg-white rounded shadow">
              <thead><tr className="bg-gray-100"><th className="p-3 text-left">Name</th><th className="p-3 text-left">Identifier</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-3">{a.displayName}</td>
                    <td className="p-3 font-mono text-sm">{a.accountIdentifier}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${a.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>{a.status}</span></td>
                    <td className="p-3 text-right">
                      {a.status === "ACTIVE" && (
                        <button onClick={() => { if (confirm(`Deactivate ${a.displayName}?`)) deactivate.mutate(a.id); }} className="text-red-600">Deactivate</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Transactions</h2>
            <p className="font-semibold">Total received: KES {totalReceived.toLocaleString()}</p>
          </div>
          {lt ? <p>Loading transactions...</p> : !txs?.length ? (
            <p className="text-gray-500">No transactions recorded yet.</p>
          ) : (
            <table className="min-w-full bg-white rounded shadow">
              <thead><tr className="bg-gray-100"><th className="p-3 text-left">Time</th><th className="p-3 text-left">Reference</th><th className="p-3 text-left">Account</th><th className="p-3 text-right">Amount</th><th className="p-3 text-left">Status</th></tr></thead>
              <tbody>
                {[...txs].sort((x, y) => +new Date(y.transactionTime) - +new Date(x.transactionTime)).map((t) => {
                  const acct = accounts?.find((a) => a.id === t.mpesaAccountId);
                  return (
                    <tr key={t.id} className="border-t">
                      <td className="p-3 text-sm">{new Date(t.transactionTime).toLocaleString()}</td>
                      <td className="p-3 font-mono text-sm">{t.externalTransactionId}</td>
                      <td className="p-3">{acct?.displayName ?? t.mpesaAccountId.slice(0, 8)}</td>
                      <td className="p-3 text-right font-semibold">KES {Number(t.amount).toLocaleString()}</td>
                      <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${t.status === "RECONCILED" ? "bg-green-100 text-green-800" : t.status === "DISPUTED" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>{t.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {showAddAccount && (
          <AddAccountModal businessId={businessId} onClose={() => setShowAddAccount(false)} />
        )}
      </main>
    </OwnerLayout>
  );
}

function AddAccountModal({ businessId, onClose }: { businessId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [accountIdentifier, setAccountIdentifier] = useState("");

  const handleSubmit = () => {
    if (!displayName || !accountIdentifier) return alert("Both fields are required.");
    api
      .post("/mpesa-accounts", { businessId, accountIdentifier, displayName })
      .then(() => {
        qc.invalidateQueries({ queryKey: ["mpesaAccounts", businessId] });
        onClose();
      })
      .catch((e: any) => alert(e?.response?.data?.message || "Failed to create account"));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-md mx-2">
        <h3 className="font-bold mb-4">Add M-Pesa Account</h3>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display Name (e.g. Till 123456)" className="border p-2 rounded w-full mb-2" />
        <input value={accountIdentifier} onChange={(e) => setAccountIdentifier(e.target.value)} placeholder="Identifier (till / phone number)" className="border p-2 rounded w-full mb-2" />
        <div className="flex gap-2">
          <button onClick={handleSubmit} className="flex-1 bg-indigo-600 text-white p-2 rounded">Create</button>
          <button onClick={onClose} className="flex-1 bg-gray-300 p-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}