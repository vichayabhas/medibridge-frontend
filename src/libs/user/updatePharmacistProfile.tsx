import { getBackendUrl, userPath } from "@/components/utility/setup";
import { PharmacistType, UpdatePharmacistProfile } from "../../../interface";

export default async function updatePharmacistProfile(
  input: UpdatePharmacistProfile,
  token: string,
): Promise<PharmacistType> {
  const response = await fetch(
    `${getBackendUrl()}/${userPath}/updatePharmacistProfile/`,
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
