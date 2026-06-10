'use client'
import { BookOpen, Search, Sparkles, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArticleReady, AuthUser } from "../../../interface";
import React from "react";
import Link from "next/link";
import { cn } from "../utility/setup";
// import { useArticleStore } from "@/stores";

type Category = "all" | "healthTip" | "review" | "product";

const categories: { key: Category; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "healthTip", label: "เคล็ดลับสุขภาพ" },
  { key: "review", label: "รีวิว" },
  { key: "product", label: "สินค้า" },
];

// const catVariant: Record<string, 'primary'|'solid-secondary'|'trust'|'muted'> = {
//   healthTip: "primary",
//   review: "solid-secondary",
//   product: "trust",
//   other: "muted",
// };
const catLabel: Record<string, string> = {
  healthTip: "เคล็ดลับสุขภาพ",
  review: "รีวิว",
  product: "สินค้า",
  other: "อื่นๆ",
};

export default function ArticlesPage({user,articles}:{user:AuthUser|null,articles:ArticleReady[]}) {
  const currentUser = user
  const isPharmacistOrAdmin = currentUser?.role === "pharmacist" || currentUser?.role === "admin";
  const [activeCategory, setActiveCategory] = React.useState<Category>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const loading=false


  const filtered = articles.filter((a) => {
    const matchCat = activeCategory === "all" || a.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="pt-20 pb-24 md:pb-10 min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="container relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-5">
            <BookOpen className="h-4 w-4" />
            บทความสุขภาพ
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            ความรู้จากเภสัชกร
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            บทความคุณภาพจากเภสัชกรวิชาชีพ ทั้งรีวิวสินค้า เคล็ดลับสุขภาพ และข้อมูลยา
          </p>

          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาบทความ เช่น พาราเซตามอล วิตามิน..."
                className="pl-10 h-12 rounded-2xl border-border/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isPharmacistOrAdmin && (
              <Link href="/articles/new">
                <Button className="h-12 px-6 rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20 w-full sm:w-auto">
                  <Plus className="h-5 w-5" />
                  เขียนบทความ
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200",
                activeCategory === c.key
                  ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
                  : "bg-background text-muted-foreground border-border/60 hover:border-primary/40 hover:text-primary"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse">กำลังโหลดบทความ...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <p className="text-sm text-muted-foreground mb-6">
              แสดง <span className="font-semibold text-foreground">{filtered.length}</span> บทความ
            </p>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((a, i) => (
                <Link key={a._id} href={`/articles/${a._id}`}>
                  <Card
                    className="reveal-up group overflow-hidden hover:-translate-y-2 hover:shadow-[var(--shadow-hover)] transition-all duration-500 border-border/40 h-full"
                    style={{ animationDelay: `${(i % 6) * 80}ms` }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={a.coverImage}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 flex gap-2 shadow-sm">
                        <Badge 
                          // variant={(catVariant[a.category?.toLowerCase()] ) ?? "muted"}
                          className="rounded-full px-3 py-1 text-xs font-bold tracking-wide border-none bg-primary/95 text-primary-foreground backdrop-blur-sm"
                        >
                          {catLabel[a.category?.toLowerCase()] || a.category || "อื่นๆ"}
                        </Badge>
                        {a.isAIGenerated && (
                          <Badge 
                            variant="secondary" 
                            className="gap-1 rounded-full px-3 py-1 text-xs font-bold tracking-wide border-none bg-secondary/95 text-secondary-foreground backdrop-blur-sm"
                          >
                            <Sparkles className="h-3 w-3" />AI
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-5 flex flex-col h-[calc(100%-12rem)]">
                      <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300 flex-1">
                        {a.title}
                      </h3>
                      <p 
                        className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: (a.excerpt || "").replace(
                            /#([\u0E00-\u0E7Fa-zA-Z0-9_]+)/g,
                            '<span class="text-primary font-bold">#$1</span>'
                          ) 
                        }}
                      />
                      <div className="flex flex-wrap gap-1 mb-4">
                        {a.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                        <span>{a.authorName.replace(/^ภ[กญ]\./, "")}</span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {a.views.toLocaleString()} อ่าน
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-24">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border border-border/40 mx-auto mb-5">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">ไม่พบบทความที่ตรงกัน</h3>
                <p className="text-muted-foreground leading-[1.75] max-w-xs mx-auto">ลองค้นหาด้วยคำอื่น หรือเปลี่ยนหมวดหมู่</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
