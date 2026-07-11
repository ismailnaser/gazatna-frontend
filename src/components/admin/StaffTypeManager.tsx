"use client";

import { useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { api } from "@/lib/api";
import type { StaffType } from "@/types/teacher";
import { Plus, Trash2 } from "lucide-react";

type StaffTypeManagerProps = {
  types: StaffType[];
  onChange: (types: StaffType[]) => void;
};

function mapStaffType(raw: Record<string, unknown>): StaffType {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    isTeacher: Boolean(raw.isTeacher),
    sortOrder: Number(raw.sortOrder ?? 0),
  };
}

export function StaffTypeManager({ types, onChange }: StaffTypeManagerProps) {
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function addType() {
    const name = newName.trim();
    if (!name) {
      setError("اكتب اسم النوع أولاً");
      return;
    }
    if (types.some((item) => item.name.trim().toLowerCase() === name.toLowerCase())) {
      setError("هذا النوع موجود مسبقاً");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const created = mapStaffType(
        (await api.createAdminStaffType({ name })) as Record<string, unknown>
      );
      onChange([...types, created].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر إضافة النوع");
    } finally {
      setSaving(false);
    }
  }

  async function removeType(type: StaffType) {
    if (type.isTeacher) {
      setError("لا يمكن حذف نوع «معلم»");
      return;
    }
    setDeletingId(type.id);
    setError("");
    try {
      await api.deleteAdminStaffType(type.id);
      onChange(types.filter((item) => item.id !== type.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر حذف النوع");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
      <div className="mb-3">
        <h3 className="font-bold text-p-black">أنواع الكادر</h3>
        <p className="mt-1 text-sm text-p-black/55">
          أضف أنواعاً مثل مدير، نائب مدير، سكرتير… لتصنيف بيانات العاملين في المدرسة.
          نوع «معلم» وحده هو الذي يملك حساب دخول في الموقع.
        </p>
      </div>

      {error ? <Alert variant="error" className="mb-3">{error}</Alert> : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {types.map((type) => (
          <span
            key={type.id}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm"
          >
            <span>{type.name}</span>
            {type.isTeacher ? (
              <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[11px] text-brand-blue">
                حساب دخول
              </span>
            ) : null}
            {!type.isTeacher ? (
              <button
                type="button"
                onClick={() => void removeType(type)}
                disabled={deletingId === type.id}
                className="text-p-black/35 transition-colors hover:text-p-red"
                aria-label={`حذف ${type.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            label="نوع جديد"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="مثال: نائب مدير"
          />
        </div>
        <Button type="button" onClick={() => void addType()} disabled={saving}>
          <Plus className="h-4 w-4" />
          {saving ? "جاري الإضافة..." : "إضافة نوع"}
        </Button>
      </div>
    </div>
  );
}
