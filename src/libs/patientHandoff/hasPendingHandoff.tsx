import { getBackendUrl } from "@/components/utility/setup";

export default async function hasPendingHandoff(token: string) {
  const response = await fetch(
    `${getBackendUrl()}/patientHandoff/hasPendingHandoff/`,
    {
      cache: "no-store",
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.ok;
}
