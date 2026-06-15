import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/options";
import BackToHome from "@/components/utility/BackToHome";
import getUserProfile from "@/libs/user/getUserProfile";
import getAdminData from "@/libs/main/getAdminData";
import AdminDashboard from "@/components/AdminDashboard";
export default async function page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <BackToHome />;
  }
  const user = await getUserProfile(session.user.token);
  if (!user || user.role != "admin") {
    return <BackToHome />;
  }
  const data = await getAdminData();
  return <AdminDashboard data={data} token={session.user.token} />;
}
