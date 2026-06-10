import { getBackendUrl } from "@/components/utility/setup";
import { ArticleReady } from "../../../interface";

export default async function getArticles(): Promise<ArticleReady[]> {
  const response = await fetch(`${getBackendUrl()}/article/getArticles/`, {
    cache: "no-store",
  });
  return await response.json();
}
