import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/options";
import BackToHome from "@/components/utility/BackToHome";
import getUserProfile from "@/libs/user/getUserProfile";
import getPharmacistShiftData from "@/libs/patientHandoff/getPharmacistShiftData";
import PharmaShiftPage from "@/components/pharma-shift/PharmaShiftPage";
export default async function page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <BackToHome />;
  }
  const user = await getUserProfile(session.user.token);
  if (user.role != "pharmacist") {
    return <BackToHome />;
  }
  const data = await getPharmacistShiftData(session.user.token);
  return <PharmaShiftPage data={data} />;
}
