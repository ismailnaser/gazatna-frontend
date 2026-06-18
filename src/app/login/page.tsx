"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Logo } from "@/components/atoms/Logo";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, loading, router]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-p-black/50">جاري التحميل...</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const ok = await login(username, password);
    setSubmitting(false);
    if (!ok) {
      setError("بيانات الدخول غير صحيحة.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo variant="icon" className="mx-auto h-12 w-12" />
          <h1 className="mt-4 text-2xl font-bold text-p-green">تسجيل الدخول</h1>
          <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-p-red" />
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
              label="اسم المستخدم"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              dir="ltr"
            />
            <Input
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="mt-6 w-full" disabled={submitting}>
            {submitting ? "جاري الدخول..." : "دخول"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-p-black/50">
          <Link href="/" className="text-p-green hover:underline">
            العودة للصفحة الرئيسية
          </Link>
        </p>
      </div>
    </div>
  );
}
