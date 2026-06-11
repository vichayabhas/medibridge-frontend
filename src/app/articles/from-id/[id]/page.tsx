import ArticleDetailPage from "@/components/article/ArticleDetailPage";
import getArticle from "@/libs/article/getArticle";
import getArticles from "@/libs/article/getArticles";
import React from "react";
export default async function page({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);
  const articles = await getArticles();
  return <ArticleDetailPage article={article} articles={articles} />;
}
