import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/options";
import BackToHome from "@/components/utility/BackToHome";
import getUserProfile from "@/libs/user/getUserProfile";
import getPharmacistData from "@/libs/user/getPharmacistData";
import PharmacistDashboard from "@/components/pharmacist/PharmacistDashboard";
export default async function page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <BackToHome />;
  }
  const user = await getUserProfile(session.user.token);
  if (!user || user.role != "pharmacist") {
    return <BackToHome />;
  }
  const data = await getPharmacistData(session.user.token);
  return <PharmacistDashboard data={data} token={session.user.token} />;
}
