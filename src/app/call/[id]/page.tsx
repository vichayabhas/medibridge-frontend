import PatientCallPage from "@/components/patientCall/PatientCallPage";
import { fetchTelemedicineMeetingToken } from "@/libs/oldApi/daily";
import getPatientCallData from "@/libs/patientHandoff/getPatientCallData";
import React from "react";

export default async function page({ params }: { params: { id: string } }) {
  const data = await getPatientCallData(params.id);
  const room = await fetchTelemedicineMeetingToken({
    handoffId: data.handoff._id,
    participantName: data.handoff.patientName,
    role: "patient",
    audioOnly: data.handoff.telemedicineChannel == "phone",
  });
  return <PatientCallPage data={data} room={room} />;
}
