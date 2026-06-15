import { getBackendUrl } from "@/components/utility/setup";
import { ArticleReady } from "../../../interface";

export default async function articleAction(
  input: Partial<ArticleReady>,
  token: string,
  id: string,
): Promise<ArticleReady[]> {
  const response = await fetch(`${getBackendUrl()}/main/articleAction/${id}`, {
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
