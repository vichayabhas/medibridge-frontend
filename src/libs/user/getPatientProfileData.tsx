import { getBackendUrl, userPath } from "@/components/utility/setup";
import { GetPatientProfileData } from "../../../interface";

export default async function getPatientProfileData(
  token: string,
): Promise<GetPatientProfileData> {
  const response = await fetch(
    `${getBackendUrl()}/${userPath}/getPatientProfileData/`,
    {
      cache: "no-store",
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return await response.json();
}
