import { getBackendUrl, userPath } from "@/components/utility/setup";
import {
  CreateOrUpdatePatientProfile,
  PatientProfileType,
} from "../../../interface";

export default async function createOrUpdatePatientProfile(
  input: CreateOrUpdatePatientProfile,
  token: string,
): Promise<PatientProfileType> {
  const response = await fetch(
    `${getBackendUrl()}/${userPath}/createOrUpdatePatientProfile/`,
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
