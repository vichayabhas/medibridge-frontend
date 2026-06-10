import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { AuthUser } from "../../../interface";
import getUserProfile from "@/libs/user/getUserProfile";
import getArticles from "@/libs/article/getArticles";
import ArticlesPage from "@/components/article/ArticlesPage";
export default async function page() {
  const session = await getServerSession(authOptions);
  let user: AuthUser | null = null;
  if (session) {
    user = await getUserProfile(session.user.token);
  }
  const articles = await getArticles();
  return <ArticlesPage user={user} articles={articles} />;
}
