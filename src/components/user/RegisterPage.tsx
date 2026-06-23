"use client";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Pill,
  ArrowRight,
  CheckCircle2,
  Shield,
  Lock,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthRoleSeed, UserRole } from "../../../interface";
import React from "react";
import Link from "next/link";
import userSignup from "../../libs/user/userSignup";
import { useRouter } from "next/navigation";
import { setTextToString } from "../utility/setup";
const seededRoles: AuthRoleSeed[] = [
  { value: "patient", label: "ผู้ใช้ทั่วไป" },
  { value: "pharmacist", label: "เภสัชกร" },
  { value: "pharmacy_admin", label: "ผู้จัดการร้านยา" },
  { value: "admin", label: "ผู้ดูแลระบบ" },
];
const SIDE_BG =
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80";

const benefits = [
  "ปรึกษาเภสัชกรฟรี ไม่มีค่าบริการซ่อน",
  "ส่งข้อมูลให้ร้านล่วงหน้า ประหยัดเวลา",
  "ประวัติการปรึกษาเก็บไว้ครบ ปลอดภัย",
  "บอทช่วยสรุปอาการก่อนส่งให้เภสัช",
  "ข้อมูลส่วนตัวเข้ารหัส ไม่แชร์โดยไม่ยินยอม",
];

export default function RegisterPage() {
  const roles = seededRoles;
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("patient");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // const update =
  //   (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
  //     setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await userSignup({
      password,
      phone,
      name,
      email,
      role,
      // avatarUrl,
    });

    setLoading(false);

    if (!result.ok) {
      setError((result as { ok: false; error: string }).error);
      return;
    }

    setDone(true);
    const target = role === "pharmacist" ? "/pharmacy-role" : "/";
    setTimeout(() => router.push(target), 1200);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Hero panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={SIDE_BG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/85 via-primary/75 to-trust/70" />
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:20px_20px]" />

        <div className="relative flex flex-col justify-center p-12 text-white w-full gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 self-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 border border-white/30 backdrop-blur-sm">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">MediBridge</span>
          </Link>

          {/* Benefits list */}
          <div>
            <h2 className="text-3xl font-bold mb-3 leading-tight">
              เริ่มต้นได้ทันที
              <br />
              <span className="text-white/80 text-2xl font-medium">
                ฟรี ไม่มีค่าใช้จ่ายแอบแฝง
              </span>
            </h2>
            <p className="text-white/75 mb-8 leading-[1.85]">
              เข้าถึงเภสัชกรที่ผ่านการรับรองใกล้บ้านคุณได้ทันที
            </p>
            <ul className="space-y-3.5">
              {benefits.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-white/90 leading-[1.75]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust row */}
          <div className="flex items-center gap-6 pt-6 border-t border-white/15 text-xs text-white/60">
            <div className="flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-white/60" />
              ใบอนุญาตเภสัชกร
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-white/60" />
              ข้อมูลปลอดภัย
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-white/60" />
              ไม่แชร์ข้อมูล
            </div>
          </div>
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-12 xl:px-20 bg-background">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/20">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">MediBridge</span>
          </div>

          {done ? (
            /* Success state */
            <div className="text-center py-10 reveal-up">
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center mb-6">
                <div
                  className="absolute inset-0 rounded-full bg-success/10 animate-ping"
                  style={{ animationDuration: "2s" }}
                />
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 border-2 border-success/30">
                  <CheckCircle2 className="h-9 w-9 text-success" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">สมัครสำเร็จ!</h2>
              <p className="text-muted-foreground leading-[1.85]">
                กำลังพาคุณเข้าสู่ระบบ...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2 leading-tight">
                  สร้างบัญชีใหม่
                </h1>
                <p className="text-muted-foreground leading-[1.85]">
                  เริ่มต้นใช้งาน MediBridge ฟรี ไม่มีค่าใช้จ่าย
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    สร้างบัญชีเป็น
                  </label>
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold" htmlFor="name">
                    ชื่อ-นามสกุล
                  </label>
                  <Input
                    id="name"
                    placeholder="สมชาย ใจดี"
                    value={name}
                    onChange={setTextToString(setName, true)}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold" htmlFor="reg-email">
                    อีเมล
                  </label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={setTextToString(setEmail, true)}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold" htmlFor="phone">
                    เบอร์โทรศัพท์
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="081-234-5678"
                    value={phone}
                    onChange={setTextToString(setPhone, true)}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold"
                    htmlFor="reg-password"
                  >
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showPw ? "text" : "password"}
                      placeholder="อย่างน้อย 8 ตัวอักษร"
                      value={password}
                      onChange={setTextToString(setPassword, true)}
                      required
                      minLength={8}
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
                  {password.length > 0 && password.length < 8 && (
                    <p className="text-xs text-destructive">
                      รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร
                    </p>
                  )}
                  {password.length >= 8 && (
                    <p className="text-xs text-success flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />{" "}
                      ความยาวรหัสผ่านเหมาะสม
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-[1.75]">
                  โดยการสมัคร คุณยอมรับ{" "}
                  <span className="text-primary font-medium cursor-pointer hover:underline">
                    นโยบายความเป็นส่วนตัว
                  </span>{" "}
                  และ{" "}
                  <span className="text-primary font-medium cursor-pointer hover:underline">
                    ข้อกำหนดการใช้งาน
                  </span>
                </p>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      กำลังสร้างบัญชี...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      สมัครสมาชิก <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
                {error && (
                  <p className="text-sm text-destructive text-center">
                    {error}
                  </p>
                )}
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                มีบัญชีอยู่แล้ว?{" "}
                <Link
                  href="/login"
                  className="text-primary font-bold hover:underline"
                >
                  เข้าสู่ระบบ
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
