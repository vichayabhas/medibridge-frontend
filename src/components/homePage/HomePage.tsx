import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  MessageCircle,
  Pill,
  Send,
  Shield,
  Sparkles,
  Star,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// import { useEffect } from "react";
import React from "react";
import Link from "next/link";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1600&q=80&auto=format&fit=crop";

const steps = [
  {
    icon: MessageCircle,
    title: "เล่าอาการให้บอทช่วยสรุป",
    desc: "กรอกอาการ ยาที่ใช้อยู่ โรคประจำตัว และประวัติแพ้ยาเป็นขั้นตอนสั้นๆ",
  },
  {
    icon: MapPin,
    title: "เลือกร้านยาใกล้บ้าน",
    desc: "ดูสถานะเภสัชกร รีวิว ระยะทาง และเวลาที่สะดวกสำหรับไปรับคำแนะนำ",
  },
  {
    icon: BadgeCheck,
    title: "ส่งข้อมูลให้เภสัชกร",
    desc: "เภสัชกรเห็นข้อมูลล่วงหน้า เตรียมคำแนะนำและลดการเล่าซ้ำที่หน้าร้าน",
  },
];

const stats = [
  { value: "24 ชม.", label: "พร้อมให้บริการตลอดเวลา" },
  { value: "6+", label: "ร้านยาพันธมิตรที่ร่วมระบบ" },
  { value: "4.8", label: "คะแนนความพึงพอใจเฉลี่ย" },
];

const benefits = [
  {
    icon: Shield,
    title: "ปลอดภัยกว่าแชททั่วไป",
    desc: "ข้อมูลถูกจัดเป็นแบบฟอร์มอ่านง่าย พร้อมแจ้งข้อจำกัดว่าไม่ใช่การวินิจฉัยโรค",
  },
  {
    icon: Clock,
    title: "ลดเวลารอที่ร้าน",
    desc: "เภสัชกรเห็นบริบทก่อนคุณไปถึง ทำให้คุยต่อได้ตรงประเด็นกว่าเดิม",
  },
  {
    icon: Lock,
    title: "ควบคุมข้อมูลได้",
    desc: "ส่งข้อมูลให้เฉพาะร้านที่เลือก และออกแบบ flow ให้ขอความยินยอมก่อนเสมอ",
  },
];

const features = [
  {
    icon: MessageCircle,
    title: "แชทบอทคัดกรองอาการ",
    desc: "บอทถามทีละข้อ รวบรวมชื่อ อาการ โรคประจำตัว ยาที่กิน และข้อมูลแพ้ยา แล้วสรุปให้เภสัชกรในรูปแบบที่ชัดเจน",
    badge: "AI-Powered",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: MapPin,
    title: "ค้นหาร้านยาใกล้เคียง",
    desc: "แผนที่แสดงร้านยาพันธมิตรในรัศมีใกล้บ้าน เรียงตามระยะทาง พร้อมสถานะออนไลน์ของเภสัชกร",
    badge: "Leaflet Map",
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "border-secondary/20",
  },
  {
    icon: Send,
    title: "ส่งข้อมูลล่วงหน้า",
    desc: "ส่งสรุปอาการไปให้ร้านยาที่เลือก เภสัชกรเห็นข้อมูลก่อน เตรียมยาล่วงหน้า ไม่ต้องรอเล่าซ้ำที่ร้าน",
    badge: "Handoff",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Clock,
    title: "นัดรับยา",
    desc: "เลือกเวลารับยาที่สะดวก เภสัชกรยืนยันและเตรียมยาให้พร้อมก่อนคุณมาถึง",
    badge: "Scheduling",
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "border-secondary/20",
  },
  {
    icon: Star,
    title: "รีวิวหลังใช้บริการ",
    desc: "ให้คะแนนและรีวิวเภสัชกรหลังรับยา ช่วยให้ชุมชนเลือกผู้เชี่ยวชาญที่ดีที่สุด",
    badge: "Reviews",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
  {
    icon: Package,
    title: "บทความสุขภาพ",
    desc: "บทความจากเภสัชกรและ AI เกี่ยวกับสินค้า รีวิวยา และเคล็ดลับสุขภาพ",
    badge: "Articles",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
];

const flowSteps = [
  { step: "1", title: "เปิดแอป + บอทถามอาการ", desc: "ตอบคำถามทีละข้อ ใช้เวลา 3–5 นาที" },
  { step: "2", title: "เลือกร้านยาใกล้บ้าน", desc: "ดูแผนที่ เปรียบเทียบรีวิว เลือกเภสัชกร" },
  { step: "3", title: "ส่งข้อมูลและนัดเวลา", desc: "เลือกเวลารับยา กดส่งข้อมูลให้ร้าน" },
  { step: "4", title: "ไปรับยาที่ร้าน", desc: "เภสัชกรเตรียมไว้แล้ว แค่แจ้งชื่อและรับยา" },
  { step: "5", title: "รีวิวและบันทึกประวัติ", desc: "ให้คะแนน ดูประวัติการปรึกษาในโปรไฟล์" },
];

const notWeAre = [
  "ร้านขายยาออนไลน์",
  "บริการส่งยาถึงบ้าน",
  "ระบบชำระเงินออนไลน์",
  "ผู้วินิจฉัยโรค",
];

const weAre = [
  "ตัวกลางเชื่อมคนไข้กับเภสัชกร",
  "ระบบรวบรวมและส่งต่อข้อมูล",
  "ช่องทางค้นหาร้านยาใกล้บ้าน",
  "แพลตฟอร์มรีวิวเภสัชกร",
];

const mockPharmacies = [
  { name: "สุขใจเภสัช", area: "ลาดพร้าว", distance: "0.8 กม.", status: "ออนไลน์", rating: "4.9" },
  { name: "บ้านยาใกล้ฉัน", area: "ห้วยขวาง", distance: "1.4 กม.", status: "ว่างใน 10 นาที", rating: "4.7" },
  { name: "เภสัชกรชุมชน", area: "รัชดา", distance: "2.1 กม.", status: "รับนัดหมาย", rating: "4.8" },
];

// const categoryLabel: Record<string, string> = {
//   health_tip: "สุขภาพ",
//   review: "รีวิว",
//   product: "สินค้า",
//   other: "ความรู้",
// };

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,hsl(204_55%_98%),hsl(0_0%_100%)_72%)] pt-24 md:pt-28">
      <div className="container relative grid min-h-[calc(100svh-4rem)] items-center gap-10 pb-12 md:grid-cols-[0.9fr_1.1fr] md:gap-12 md:pb-16">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/15 bg-white px-3.5 py-2 text-xs font-bold text-primary shadow-sm">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">MediBridge — เชื่อมคนไข้กับเภสัชกร</span>
          </div>
          <h1 className="max-w-[12ch] text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
            ปรึกษาเภสัชกร
            <span className="block text-primary">ก่อนถึงร้านยา</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg">
            สรุปอาการ เลือกร้านยาใกล้คุณ และส่งข้อมูลให้เภสัชกรล่วงหน้าใน flow เดียว
            เพื่อให้การรับคำแนะนำเรื่องยาเป็นระบบและไม่ต้องเล่าซ้ำ
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-foreground/70 shadow-sm">
              <BadgeCheck className="h-3.5 w-3.5 text-success" />
              เภสัชกรมีใบอนุญาต
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-foreground/70 shadow-sm">
              <Lock className="h-3.5 w-3.5 text-primary" />
              ขอความยินยอมก่อนส่ง
            </span>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link  href="/nearby?tab=pharmacist" >
                เริ่มปรึกษา
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full bg-white/80 sm:w-auto">
              <Link href="/nearby">
                <MapPin className="h-4 w-4" />
                ดูร้านยาใกล้ฉัน
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid max-w-xl divide-y divide-border/70 rounded-2xl border border-border/70 bg-white/80 shadow-[var(--shadow-card)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((item) => (
              <div key={item.label} className="p-4">
                <p className="text-xl font-bold text-foreground sm:text-2xl">{item.value}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[1.75rem] border border-white bg-white p-2 shadow-[var(--shadow-elevated)]">
            <div className="relative h-[min(72svh,620px)] min-h-[440px] overflow-hidden rounded-[1.35rem] bg-muted md:h-[min(68vh,640px)] md:min-h-[560px]">
              <img src={HERO_IMAGE} alt="เภสัชกรกำลังให้คำแนะนำในร้านยา" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(215_28%_13%/0.06),hsl(215_28%_13%/0.28))]" />
              <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
                <div className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-bold text-success shadow-md">
                  <div className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success" />
                  เภสัชกรออนไลน์
                </div>
                  <h2 className="sr-only">
                    เลือกร้านยาใกล้บ้าน แล้วคุยกับเภสัชกรได้ตรงประเด็น
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Workflow</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">ขั้นตอนสั้นๆ ก่อนพบเภสัชกร</h2>
          <p className="mt-3 text-muted-foreground">เพียงไม่กี่ขั้นตอน คุณก็สามารถรับคำแนะนำจากเภสัชกรได้อย่างรวดเร็วและมีประสิทธิภาพ</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="h-full border-border/60">
              <CardContent className="flex h-full flex-col p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-4xl font-black leading-none text-primary/10">0{index + 1}</span>
                </div>
                <h3 className="text-lg font-bold leading-7">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function PharmacyPreview() {
  return (
    <section className="bg-muted/45 py-16 md:py-24">
      <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Badge variant="default" className="mb-4 bg-background">ร้านยาพันธมิตร</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">เลือกร้านจากข้อมูลที่อ่านง่าย</h2>
          <p className="mt-4 max-w-xl leading-8 text-muted-foreground">
            ดูข้อมูลร้านยาที่ครบถ้วน ทั้งระยะทาง สถานะเภสัชกร และคะแนนรีวิว
            ช่วยให้คุณตัดสินใจเลือกร้านได้อย่างมั่นใจ
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Badge variant="success" dot="online">ออนไลน์</Badge>
            <Badge variant="warning">มีเภสัชกรประจำ</Badge>
            <Badge variant="muted">รับยาที่ร้านโดยตรง</Badge>
          </div>
        </div>
        <div className="grid gap-4">
          {mockPharmacies.map((pharmacy) => (
            <Card key={pharmacy.name} className="border-white bg-white">
              <CardContent className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/10">
                    <Pill className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold">{pharmacy.name}</h3>
                    <p className="text-sm text-muted-foreground">{pharmacy.area} · {pharmacy.distance}</p>
                    <p className="mt-2 text-sm text-success">{pharmacy.status}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1 text-sm font-bold text-warning">
                    <Star className="h-4 w-4 fill-warning" />
                    {pharmacy.rating}
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/nearby">ดูรายละเอียด</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="grid gap-5 md:grid-cols-3">
          {benefits.map((item) => (
            <div key={item.title} className="rounded-3xl border border-border/60 bg-background p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WeAreSection() {
  return (
    <section className="py-16 bg-muted/40">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-6">
              <h3 className="font-bold text-success mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" /> เราคือ
              </h3>
              <ul className="space-y-3">
                {weAre.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-6">
              <h3 className="font-bold text-destructive mb-4 flex items-center gap-2">
                <span className="h-5 w-5 flex items-center justify-center rounded-full border-2 border-destructive text-xs font-black">✕</span>
                เราไม่ใช่
              </h3>
              <ul className="space-y-3">
                {notWeAre.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground line-through">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive/50 shrink-0 no-underline" style={{ textDecoration: "none" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function FeaturesGrid() {
  return (
    <section className="py-24">
      <div className="container">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary tracking-[0.2em] uppercase mb-3">ฟีเจอร์</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">สิ่งที่ MediBridge มีให้</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card
              key={f.title}
              className="reveal-up group hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/8 transition-all duration-500 border-border/50"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <CardContent className="p-7">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.bg} border ${f.border} mb-5 group-hover:scale-110 transition-transform duration-500`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <div className="flex items-start justify-between mb-3 gap-2">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">{f.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${f.bg} ${f.color} border ${f.border} font-semibold whitespace-nowrap`}>{f.badge}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FlowSteps() {
  return (
    <section className="py-20 bg-muted/40">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary tracking-[0.2em] uppercase mb-3">ขั้นตอน</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">ใช้งานอย่างไร?</h2>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {flowSteps.map((s, i) => (
            <div
              key={s.step}
              className="reveal-up flex items-start gap-5 p-5 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white font-bold text-sm">
                {s.step}
              </div>
              <div>
                <h4 className="font-bold mb-1">{s.title}</h4>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/nearby?tab=pharmacist">
            <Button size="lg" className="rounded-2xl px-10 h-14 text-base">
              เริ่มต้นตอนนี้ <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedArticles() {
  // const { articles, fetchArticles } = useArticleStore();

  // useEffect(() => {
  //   fetchArticles();
  // }, [fetchArticles]);

  // const featured = articles.slice(0, 3);

  return (
    <section className="bg-[hsl(204_55%_97%)] py-16 md:py-24">
      <div className="container">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Articles</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">บทความสุขภาพจากเภสัชกร</h2>
          </div>
          <Button asChild variant="outline" className="w-full bg-white sm:w-auto">
            <Link href="/articles">
              ดูบทความทั้งหมด
              <BookOpen className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {/* {featured.map((article) => (
            <Link key={article.id} href={`/articles/from-id/${article.id}`} className="group">
              <Card className="h-full overflow-hidden border-white bg-white transition-transform duration-300 group-hover:-translate-y-1">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img src={article.cover_image} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <CardContent className="p-5">
                  <Badge variant="muted" className="mb-3">{categoryLabel[article.category?.toLowerCase()] ?? "บทความ"}</Badge>
                  <h3 className="line-clamp-2 min-h-[3.5rem] font-bold leading-7 group-hover:text-primary">{article.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">{article.excerpt}</p>
                </CardContent>
              </Card>
            </Link>
          ))} */}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="rounded-[2rem] bg-gradient-to-br from-primary to-secondary p-7 text-white shadow-[var(--shadow-hover)] sm:p-10 md:p-14">
          <div className="mx-auto max-w-3xl text-center">
            <CheckCircle2 className="mx-auto mb-5 h-10 w-10" />
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">พร้อมเริ่มใช้ MediBridge</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-8 text-white/82">
              ปรึกษาเภสัชกรก่อนถึงร้านยา สรุปอาการ เลือกร้านยาใกล้คุณ และส่งข้อมูลให้เภสัชกรล่วงหน้า
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/nearby?tab=pharmacist">เริ่มปรึกษาเภสัชกร</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/35 bg-white/10 text-white hover:bg-white/20">
                <Link href="/nearby">ดูร้านยาใกล้ฉัน</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WeAreSection />
      <FeaturesGrid />
      <HowItWorks />
      <FlowSteps />
      <PharmacyPreview />
      <Benefits />
      <FeaturedArticles />
      <CtaSection />
    </>
  );
}
