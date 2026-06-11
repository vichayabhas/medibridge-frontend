import { getBackendUrl } from "@/components/utility/setup";
import { PatientHandoffType } from "../../../interface";
import { Id } from "../../../configTypes";

export default async function updatePatientHandoff(
  id: Id,
  input: Partial<PatientHandoffType>,
  // token: string
):Promise<PatientHandoffType[]> {
  const response = await fetch(
    `${getBackendUrl()}/patientHandoff/updatePatientHandoff/${id}`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        // authorization: `Bearer ${token }`,
      },
      body: JSON.stringify(input),
    },
  );
  return await response.json();
}
