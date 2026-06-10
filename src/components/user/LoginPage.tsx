"use client";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Pill,
  ArrowRight,
  Shield,
  BadgeCheck,
  Lock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { signIn } from "next-auth/react";
import React from "react";
import { useRouter } from "next/navigation";
// import { useAppSelector } from "@/store/store";
import Link from "next/link";

const SIDE_BG =
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80";

const trustPoints = [
  { icon: BadgeCheck, text: "เภสัชกรมีใบอนุญาตทุกคน" },
  { icon: Lock, text: "ข้อมูลเข้ารหัสปลอดภัย" },
  { icon: Shield, text: "ไม่แชร์ข้อมูลโดยไม่ยินยอม" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [role, setRole] = useState<AuthRole>("general_user");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const navigate = useNavigate();
  // const location = useLocation();
  // const roles = useAuthStore((state) => state.roles);
  // const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // const result = await login({ email, password, role });
    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
    });

    setLoading(false);

    if (!result?.ok) {
      setError((result as { ok: false; error: string }).error);
      return;
    }

    // const from = useAppSelector((state) => state.previousURL.value);
    // router.push(from);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={SIDE_BG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-trust/85 via-primary/75 to-secondary/65" />
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:20px_20px]" />

        <div className="relative flex flex-col justify-between p-12 text-white w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 border border-white/30 backdrop-blur-sm">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">MediBridge</span>
          </Link>

          <div className="glass-surface rounded-3xl p-8">
            <div className="flex gap-0.5 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-4 w-4 fill-warning text-warning" />
              ))}
            </div>
            <blockquote className="text-lg font-medium leading-[1.75] mb-5">
              {`"MediBridge ช่วยให้ฉันส่งข้อมูลให้เภสัชกรล่วงหน้า ถึงร้านแล้วรับยาได้เลย ไม่ต้องรอเลยสักนาที"`}
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/25 border border-white/30 flex items-center justify-center font-bold text-sm">
                ส
              </div>
              <div>
                <p className="font-semibold text-sm">คุณสมหญิง</p>
                <p className="text-xs text-white/65">
                  ผู้ใช้งาน MediBridge · กรุงเทพฯ
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-8 text-sm">
            {[
              ["500+", "ผู้ใช้งาน"],
              ["6", "ร้านยาพันธมิตร"],
              ["4.8★", "คะแนนรีวิว"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-bold">{v}</p>
                <p className="text-white/60 text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-12 xl:px-20 bg-background">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/20">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">MediBridge</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2 leading-tight">
              ยินดีต้อนรับกลับ
            </h1>
            <p className="text-muted-foreground leading-[1.85]">
              เข้าสู่ระบบเพื่อปรึกษาเภสัชกรและส่งข้อมูลได้เลย
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* <div className="space-y-2">
              <label className="text-sm font-semibold">เข้าสู่ระบบเป็น</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRole(item.value)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                      role === item.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div> */}

            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="email">
                อีเมล
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold" htmlFor="password">
                  รหัสผ่าน
                </label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  เข้าสู่ระบบ
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </form>

          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">
                หรือ
              </span>
            </div>
          </div>

          <Card className="border-border/40 hover:border-primary/25 hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full flex items-center justify-center gap-3 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors tap-target"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border/40 text-base">
                  👤
                </div>
                เข้าใช้แบบไม่ลงทะเบียน (Guest)
              </button>
            </CardContent>
          </Card>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            บัญชีทดสอบ: <br />
            สำหรับผู้ใช้ทั่วไป user@medibridge.app / password123 <br />
            สำหรับเภสัชกร pharmacist@medibridge.app / password123 <br />
            สำหรับผู้จัดการร้านยา pharmacy@medibridge.app / password123 <br />
            สำหรับผู้ดูแลระบบ admin@medibridge.app / password123
          </p>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ยังไม่มีบัญชี?{" "}
            <Link
              href="/register"
              className="text-primary font-bold hover:underline"
            >
              สมัครสมาชิก
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-border/40">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {trustPoints.map((t) => (
                <div
                  key={t.text}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <t.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                  {t.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
