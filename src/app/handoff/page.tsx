import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";
import BackToHome from "@/components/utility/BackToHome";
import React from "react";
import HandoffPage from "@/components/HandoffPage";
import getPatientProfileData from "@/libs/user/getPatientProfileData";

export default async function page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <BackToHome />;
  }
  const data = await getPatientProfileData(session.user.token);
  if (!data.patient) {
    return <BackToHome />;
  }
  return (
    <HandoffPage token={session.user.token} patientProfile={data.patient} />
  );
}
