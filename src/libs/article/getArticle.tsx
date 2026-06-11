import { getBackendUrl } from "@/components/utility/setup";
import { Id } from "../../../configTypes";
import { ArticleReady } from "../../../interface";

export default async function getArticle(id: Id): Promise<ArticleReady> {
  const response = await fetch(`${getBackendUrl()}/article/getArticle/${id}`, {
    cache: "no-store",
  });
  return await response.json();
}
