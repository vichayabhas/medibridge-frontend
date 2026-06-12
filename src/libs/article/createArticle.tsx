import { getBackendUrl } from "@/components/utility/setup";
import { CreateArticle } from "../../../interface";

export default async function createArticle(
  input: CreateArticle,
  token: string,
) {
  const response = await fetch(`${getBackendUrl()}/article/createArticle/`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  return await response.json();
}
