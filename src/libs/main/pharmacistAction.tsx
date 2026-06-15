import { getBackendUrl } from "@/components/utility/setup";
import { PharmacistType, PharmacyWithDistance } from "../../../interface";

export default async function pharmacistAction(
  input: Partial<PharmacistType>,
  token: string,
  id: string,
): Promise<{
  pharmacies: PharmacyWithDistance[];
  pharmacists: PharmacistType[];
}> {
  const response = await fetch(
    `${getBackendUrl()}/main/pharmacistAction/${id}`,
    {
      method: "PUT",
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
