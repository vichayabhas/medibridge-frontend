import { getBackendUrl } from "@/components/utility/setup";

export default async function getPatientHandoffs(token: string) {
  const response = await fetch(
    `${getBackendUrl()}/patientHandoff/getPatientHandoffs/`,
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    },
  );const data=await response.json()
  return data.rows
}

