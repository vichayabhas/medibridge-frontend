import {
  ChevronLeft,
  BookOpen,
  Calendar,
  Eye,
  Sparkles,
  MessageCircle,
  BadgeCheck,
  Clock,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import React from "react";
import Link from "next/link";
import AIGeneratePanel from "./AIGeneratePanel";
import { useRouter } from "next/navigation";
import { ArticleReady } from "../../../interface";
import Image from "next/image";

const catLabel: Record<string, string> = {
  health_tip: "เคล็ดลับสุขภาพ",
  review: "รีวิว",
  product: "สินค้า",
  other: "อื่นๆ",
};
const catVariant: Record<string, "default" | "secondary" | "muted"> = {
  health_tip: "default",
  review: "secondary",
  product: "muted",
  other: "muted",
};





export default function ArticleDetailPage({article,articles}:{article:ArticleReady,articles:ArticleReady[]}) {
  const navigate = useRouter();



  const { processedHtml, toc } = useMemo(() => {
    const htmlContent = article.body || "";

    if (typeof window !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const headings = doc.querySelectorAll('h2, h3');
      const tocItems: { id: string, text: string, level: number }[] = [];

      headings.forEach((heading, index) => {
        const text = heading.textContent || '';
        const slug = text.trim() !== '' ? text.trim().replace(/\s+/g, '-').replace(/[^\w\u0E00-\u0E7F-]/g, '') : `heading-${index}`;
        const id_param = heading.id || (slug ? `section-${slug}` : `heading-${index}`);
        heading.id = id_param;
        tocItems.push({
          id: id_param,
          text: text,
          level: heading.tagName === 'H2' ? 2 : 3
        });
      });

      return { processedHtml: doc.body.innerHTML, toc: tocItems };
    }
    return { processedHtml: htmlContent, toc: [] };
  }, [article]);

  // if (loading || !currentArticle) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen gap-4">
  //       <Loader2 className="h-10 w-10 text-primary animate-spin" />
  //       <p className="text-muted-foreground animate-pulse">กำลังโหลดเนื้อหาบทความ...</p>
  //     </div>
  //   );
  // }


  const related = articles
    .filter((a) => a._id !== article._id && a.category?.toLowerCase() === article.category?.toLowerCase())
    .slice(0, 3);

  const readingMinutes = Math.max(1, Math.round((article.body || "").split(" ").length / 150));

  return (
    <div className="pt-20 pb-28 md:pb-12 min-h-screen bg-background">
      <div className="container py-6">
        <button
          onClick={() => navigate.push('../')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          กลับหน้าบทความ
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
          <article>
            <div className="flex flex-wrap gap-2 mb-5">
              <Badge variant={catVariant[article.category?.toLowerCase()] ?? "muted"}>
                {catLabel[article.category?.toLowerCase()] || article.category}
              </Badge>
              {article.isAIGenerated && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI-Assisted
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-5 leading-[1.25]">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 mb-8 flex-wrap pb-6 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <Avatar name={article.authorName} size="sm" />
                <div>
                  <p className="text-sm font-semibold">{article.authorName}</p>
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <BadgeCheck className="h-3 w-3" />
                    เภสัชกรวิชาชีพ
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(article.createAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  {article.views.toLocaleString()} ครั้ง
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  อ่าน {readingMinutes} นาที
                </span>
              </div>
            </div>

            {article.coverImage && (
              <div className="rounded-3xl overflow-hidden mb-8 shadow-xl shadow-primary/6">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-72 md:h-96 object-cover"
                />
              </div>
            )}

            <p className="text-lg text-muted-foreground mb-6 leading-[1.85] font-light">
              {article.excerpt}
            </p>

            {toc.length > 0 && (
              <div className="mb-8 p-6 rounded-2xl bg-muted/40 border border-border/50">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  สารบัญ
                </h3>
                <ul className="space-y-2.5 text-sm">
                  {toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? "ml-4" : ""}>
                      <a
                        href={`#${item.id}`}
                        className="text-muted-foreground hover:text-primary hover:underline transition-colors flex items-center gap-2"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0"></span>
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              className="article-body text-foreground/88 leading-[1.85] mb-8"
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />

            <div className="space-y-5 text-foreground/88 leading-[1.85] pt-6 border-t border-border/40">
              <p>
                การรับประทานยาอย่างถูกต้องและปลอดภัยเป็นสิ่งสำคัญที่ทุกคนควรใส่ใจ
                หากคุณมีข้อสงสัยเกี่ยวกับยาหรือการรักษา ควรปรึกษาเภสัชกรหรือแพทย์โดยตรงเสมอ
                อย่าซื้อยาเองโดยไม่ได้รับคำแนะนำจากผู้เชี่ยวชาญ
              </p>
              <p>
                MediBridge ช่วยให้คุณเข้าถึงเภสัชกรวิชาชีพได้อย่างง่ายดาย
                เพียงบอกอาการผ่านแชทบอท แล้วส่งข้อมูลให้ร้านยาใกล้บ้านได้ทันที
                เภสัชกรจะรับทราบและเตรียมยาก่อนที่คุณจะมาถึง
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border/40">
              {article.tags.map((t) => (
                <span
                  key={t}
                  className="text-sm px-3.5 py-1.5 rounded-full bg-muted text-muted-foreground border border-border/40 hover:border-primary/30 hover:text-primary transition-colors cursor-pointer"
                >
                  #{t}
                </span>
              ))}
            </div>

            <div className="mt-10 p-6 rounded-3xl bg-gradient-to-r from-primary/6 to-secondary/6 border border-primary/15 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-1">มีคำถามเกี่ยวกับบทความนี้?</h3>
                <p className="text-sm text-muted-foreground leading-[1.75]">
                  ปรึกษาเภสัชกรได้โดยตรง ฟรี ไม่มีค่าบริการ
                </p>
              </div>
              <Link href="/nearby?tab=pharmacist">
                <Button className="rounded-xl shadow-md shadow-primary/20 shrink-0">
                  ปรึกษาเภสัช
                </Button>
              </Link>
            </div>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <AIGeneratePanel articleTitle={article.title} articleText={article.excerpt + " " + article.body} />

            {related.length > 0 && (
              <div>
                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  บทความที่เกี่ยวข้อง
                </h3>
                <div className="space-y-3">
                  {related.map((a) => (
                    <Link key={a._id} href={`/articles/${a._id}`}>
                      <Card className="group border-border/40 hover:border-primary/25 hover:shadow-md transition-all duration-300">
                        <CardContent className="p-4 flex gap-3">
                          <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden">
                            <img
                              src={a.coverImage}
                              alt={a.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
                              {a.title}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Eye className="h-2.5 w-2.5" />
                              {a.views.toLocaleString()} อ่าน
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Card className="border-primary/20 bg-gradient-to-br from-mint to-accent/40">
              <CardContent className="p-5 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mx-auto mb-3">
                  <BadgeCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-1.5">มีคำถามเรื่องยา?</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-[1.75]">
                  ปรึกษาเภสัชกรจริง ฟรี ไม่มีค่าบริการ
                </p>
                <Link href="/nearby?tab=pharmacist">
                  <Button className="w-full rounded-xl shadow-sm shadow-primary/20" size="sm">
                    เริ่มปรึกษาเลย
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
