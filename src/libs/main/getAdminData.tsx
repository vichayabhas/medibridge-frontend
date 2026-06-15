import { getBackendUrl } from "@/components/utility/setup";
import { AdminData } from "../../../interface";

export default async function getAdminData(): Promise<AdminData> {
  const response = await fetch(`${getBackendUrl()}/main/getAdminData/`, {
    cache: "no-store",
  });
  return await response.json();
}
