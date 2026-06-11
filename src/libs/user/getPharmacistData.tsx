import { getBackendUrl, userPath } from "@/components/utility/setup";
import { GetPharmacistData } from "../../../interface";

export default async function getPharmacistData(
  token: string,
): Promise<GetPharmacistData> {
  const response = await fetch(
    `${getBackendUrl()}/${userPath}/getPharmacistData/`,
    {
      cache: "no-store",
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return await response.json();
}
