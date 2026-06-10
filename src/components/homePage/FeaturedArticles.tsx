"use client";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ArticleReady } from "../../../interface";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
const categoryLabel: Record<string, string> = {
  health_tip: "สุขภาพ",
  review: "รีวิว",
  product: "สินค้า",
  other: "ความรู้",
};

export default function FeaturedArticles({articleReadies}:{articleReadies:ArticleReady[]}) {
  // const { articles, fetchArticles } = useArticleStore();

  // useEffect(() => {
  //   fetchArticles();
  // }, [fetchArticles]);

  const featured = articleReadies.slice(0, 3);

  return (
    <section className="bg-[hsl(204_55%_97%)] py-16 md:py-24">
      <div className="container">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
              Articles
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              บทความสุขภาพจากเภสัชกร
            </h2>
          </div>
          <Button
            asChild
            variant="outline"
            className="w-full bg-white sm:w-auto"
          >
            <Link href="/articles">
              ดูบทความทั้งหมด
              <BookOpen className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {featured.map((article) => (
            <Link key={article._id} href={`/articles/from-id/${article._id}`} className="group">
              <Card className="h-full overflow-hidden border-white bg-white transition-transform duration-300 group-hover:-translate-y-1">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <CardContent className="p-5">
                  <Badge variant="muted" className="mb-3">{categoryLabel[article.category?.toLowerCase()] ?? "บทความ"}</Badge>
                  <h3 className="line-clamp-2 min-h-[3.5rem] font-bold leading-7 group-hover:text-primary">{article.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">{article.excerpt}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
