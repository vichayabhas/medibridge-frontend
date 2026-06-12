import { getBackendUrl } from "@/components/utility/setup";
import { CreatePatientHandoff, PatientHandoffType } from "../../../interface";

export default async function savePatientHandoff(
  input: CreatePatientHandoff,
  token: string,
): Promise<PatientHandoffType[]|{success:boolean,error?:string}> {
  const response = await fetch(
    `${getBackendUrl()}/patientHandoff/savePatientHandoff/`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    },
  );
  return await response.json();
}
