"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Logo } from "@/components/atoms/Logo";
import { AppLoadingScreen } from "@/components/molecules/AppLoadingScreen";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/lib/auth";
import { getRememberMePreference, getRememberedUsername } from "@/lib/authStorage";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, router]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setUsername(getRememberedUsername());
    setRememberMe(getRememberMePreference());
  }, []);

  if (user || submitting) {
    return <AppLoadingScreen />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const ok = await login(username, password, rememberMe);
    setSubmitting(false);
    if (!ok) {
      setError("بيانات الدخول غير صحيحة.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto h-12 w-auto" />
          <h1 className="font-display mt-4 text-3xl font-extrabold text-p-green">تسجيل الدخول</h1>
          <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-p-red" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem_1rem_2rem_1.2rem] border-[3px] border-brand-blue/20 bg-white/80 p-6 shadow-[-7px_8px_0_0_rgba(66,76,243,0.16)] backdrop-blur-sm"
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
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              dir="ltr"
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((open) => !open)}
                  className="rounded-lg p-1.5 text-p-black/45 transition-colors hover:bg-neutral-100 hover:text-p-black"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <Checkbox
              checked={rememberMe}
              onChange={setRememberMe}
              label="تذكرني"
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
