import { getBackendUrl } from "@/components/utility/setup";

export default async function getPharmacistShiftData(token: string) {
  const response = await fetch(
    `${getBackendUrl()}/patientHandoff/getPharmacistShiftData/`,
    {
      cache: "no-store",
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return await response.json();
}
