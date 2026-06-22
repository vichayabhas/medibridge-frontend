import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/options";
import BackToHome from "@/components/utility/BackToHome";
import ProfilePage from "@/components/user/ProfilePage";
import getPatientProfileData from "@/libs/user/getPatientProfileData";
export default async function page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <BackToHome />;
  }
  const data = await getPatientProfileData(session.user.token);
  return <ProfilePage data={data} token={session.user.token} />;
}
