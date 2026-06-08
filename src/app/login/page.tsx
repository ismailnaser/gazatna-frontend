"use client";

import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { AlAqsaCircuit } from "@/components/decor/AlAqsaCircuit";
import { TatreezCircuit } from "@/components/decor/TatreezCircuit";
import { useAuth } from "@/context/AuthContext";

const demoAccounts = [
  { email: "admin@ghazatna.edu.ps", role: "مدير" },
  { email: "teacher@ghazatna.edu.ps", role: "معلم" },
  { email: "parent@ghazatna.edu.ps", role: "ولي أمر" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!login(email, password)) {
      setError("بيانات الدخول غير صحيحة. استخدم أحد الحسابات التجريبية أدناه.");
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-4">
      <TatreezCircuit className="pointer-events-none absolute -start-8 top-0 hidden h-full w-48 opacity-60 lg:block" />
      <AlAqsaCircuit className="pointer-events-none absolute -end-8 bottom-0 hidden w-64 opacity-60 lg:block" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <GraduationCap className="h-10 w-10 text-p-green" />
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-p-green">تسجيل الدخول</h1>
          <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-p-red" />
          <p className="mt-3 text-sm text-p-black/50">
            النظام يوجّهك تلقائياً للوحة التحكم المناسبة لدورك
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"
        >
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="space-y-4">
            <Input
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@ghazatna.edu.ps"
              required
            />
            <Input
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أي كلمة مرور (عرض تجريبي)"
              required
            />
          </div>

          <Button type="submit" className="mt-6 w-full">
            دخول
          </Button>
        </form>

        <div className="mt-6 rounded-2xl border border-neutral-100 bg-white/80 p-4">
          <p className="mb-3 text-xs font-semibold text-p-black/60">حسابات تجريبية:</p>
          <div className="space-y-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword("demo");
                }}
                className="flex w-full items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-start text-xs hover:bg-[#064e3b]/5"
              >
                <span className="font-medium text-p-black/80">{acc.role}</span>
                <span className="text-p-black/50" dir="ltr">
                  {acc.email}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-p-black/50">
          <Link href="/" className="text-p-green hover:underline">
            العودة للصفحة الرئيسية
          </Link>
        </p>
      </div>
    </div>
  );
}
