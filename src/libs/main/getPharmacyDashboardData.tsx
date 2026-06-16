import { getBackendUrl } from "@/components/utility/setup";
import { PharmacyDashboardData } from "../../../interface";

export default async function getPharmacyDashboardData(
  token: string,
): Promise<PharmacyDashboardData> {
  const response = await fetch(
    `${getBackendUrl()}/main/getPharmacyDashboardData/`,
    {
      cache: "no-store",
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return await response.json();
}
