import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import BackToHome from "@/components/utility/BackToHome";
import WriteArticlePage from "@/components/WriteArticlePage";
import getUserProfile from "@/libs/user/getUserProfile";
import { getServerSession } from "next-auth";
import React from "react";
export default async function page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <BackToHome />;
  }
  const user = await getUserProfile(session.user.token);
  if (!user || user.role != "pharmacist") {
    return <BackToHome />;
  }
  return <WriteArticlePage token={session.user.token} />;
}
