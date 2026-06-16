import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/options";
import BackToHome from "@/components/utility/BackToHome";
import getUserProfile from "@/libs/user/getUserProfile";
import getPharmacyDashboardData from "@/libs/main/getPharmacyDashboardData";
import PharmacyDashboard from "@/components/PharmacyDashboard";
export default async function page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <BackToHome />;
  }
  const user = await getUserProfile(session.user.token);
  if (!user || user.role != "pharmacy_admin") {
    return <BackToHome />;
  }
  const data = await getPharmacyDashboardData(session.user.token);
  return <PharmacyDashboard data={data} token={session.user.token} />;
}
