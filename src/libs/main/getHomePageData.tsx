import { getBackendUrl } from "@/components/utility/setup";
import { HomePageData } from "../../../interface";

export default async function getHomePageData(): Promise<HomePageData> {
    console.log(`${getBackendUrl()}/main/getHomePageData/`)
  const response = await fetch(`${getBackendUrl()}/main/getHomePageData/`, {
    cache: "no-store",
  });
  return await response.json();
}
