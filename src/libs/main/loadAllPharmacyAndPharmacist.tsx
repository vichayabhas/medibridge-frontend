import { getBackendUrl } from "@/components/utility/setup";
import { PharmacistType, PharmacyWithDistance } from "../../../interface";

export default async function loadAllPharmacyAndPharmacist(): Promise<{
  pharmacies: PharmacyWithDistance[];
  pharmacists: PharmacistType[];
}> {
  const response = await fetch(
    `${getBackendUrl()}/main/loadAllPharmacyAndPharmacist/`,
    {
      cache: "no-store",
    },
  );
  return await response.json();
}
