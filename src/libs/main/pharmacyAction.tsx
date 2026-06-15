import { getBackendUrl } from "@/components/utility/setup";
import { PharmacistType, PharmacyWithDistance } from "../../../interface";

export default async function pharmacyAction(
  input: Partial<PharmacyWithDistance>,
  token: string,
): Promise<{
  pharmacies: PharmacyWithDistance[];
  pharmacists: PharmacistType[];
}> {
  const response = await fetch(`${getBackendUrl()}/main/pharmacyAction/`, {
    method: "PUT",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  return await response.json();
}
