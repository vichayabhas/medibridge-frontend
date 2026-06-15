import { getBackendUrl } from "@/components/utility/setup";
import { ConsultationData } from "../../../interface";

export default async function getPatientHandoffsForConsultation(
  token: string,
): Promise<ConsultationData[]> {
  const response = await fetch(
    `${getBackendUrl()}/patientHandoff/getPatientHandoffsForConsultation/`,
    {
      cache: "no-store",
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return await response.json();
}
