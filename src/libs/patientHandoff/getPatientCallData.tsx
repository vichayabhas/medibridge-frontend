import { getBackendUrl } from "@/components/utility/setup";
import { PatientCallData } from "../../../interface";

export default async function getPatientCallData(
  id: string,
): Promise<PatientCallData> {
  const response = await fetch(
    `${getBackendUrl()}/patientHandoff/getPatientCallData/${id}`,
    {
      cache: "no-store",
    },
  );
  return await response.json();
}
