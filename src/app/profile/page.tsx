import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/options";
import BackToHome from "@/components/utility/BackToHome";
import getUserProfile from "@/libs/user/getUserProfile";
import loadAllPharmacyAndPharmacist from "@/libs/main/loadAllPharmacyAndPharmacist";
import ProfilePage from "@/components/user/ProfilePage";
export default async function page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <BackToHome />;
  }
  const user = await getUserProfile(session.user.token);
  const data = await loadAllPharmacyAndPharmacist();
  return <ProfilePage user={user} data={data} token={session.user.token} />;
}
