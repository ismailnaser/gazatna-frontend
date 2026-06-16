"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { api } from "@/lib/api";
import { Archive, RefreshCw } from "lucide-react";

type Msg = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "new" | "archived";
  createdAt: string;
};

export default function AdminMessagesPage() {
  const [items, setItems] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = (await api.getAdminMessages()) as unknown[];
      setItems(res as Msg[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل الرسائل");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const newMsgs = useMemo(() => items.filter((m) => m.status === "new"), [items]);
  const archived = useMemo(() => items.filter((m) => m.status === "archived"), [items]);

  async function archive(id: string) {
    setError("");
    setSuccess("");
    try {
      await api.archiveAdminMessage(id);
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, status: "archived" } : m)));
      setSuccess("تمت الأرشفة.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر الأرشفة");
    }
  }

  return (
    <div>
      <PageHeader title="رسائل تواصل معنا" description="الرسائل المرسلة من صفحة تواصل معنا" />

      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="mb-6">
        <Button type="button" variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className="h-4 w-4" />
          {loading ? "جاري التحميل..." : "تحديث"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-bold text-p-black">جديدة ({newMsgs.length})</h3>
          {newMsgs.length === 0 ? (
            <p className="text-sm text-neutral-500">لا توجد رسائل جديدة.</p>
          ) : (
            <div className="space-y-3">
              {newMsgs.map((m) => (
                <div key={m.id} className="rounded-xl border border-neutral-100 p-4">
                  <p className="font-semibold text-p-black">{m.name}</p>
                  <p className="mt-1 text-xs text-p-black/50">{m.email}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-p-black/70">{m.message}</p>
                  <div className="mt-4">
                    <Button type="button" variant="outline" className="text-xs" onClick={() => archive(m.id)}>
                      <Archive className="h-4 w-4" />
                      أرشفة
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 font-bold text-p-black">مؤرشفة ({archived.length})</h3>
          {archived.length === 0 ? (
            <p className="text-sm text-neutral-500">لا توجد رسائل مؤرشفة.</p>
          ) : (
            <div className="space-y-3">
              {archived.slice(0, 20).map((m) => (
                <div key={m.id} className="rounded-xl border border-neutral-100 p-4">
                  <p className="font-semibold text-p-black">{m.name}</p>
                  <p className="mt-1 text-xs text-p-black/50">{m.email}</p>
                </div>
              ))}
              {archived.length > 20 && <p className="text-xs text-neutral-500">عرض 20 فقط.</p>}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

