import { getBackendUrl, userPath } from "@/components/utility/setup";
import { AuthUser } from "../../../../interface";
export default async function getUserProfile(
  token: string
): Promise<AuthUser> {
  const response = await fetch(`${getBackendUrl()}/${userPath}/me`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  return await response.json();
}
