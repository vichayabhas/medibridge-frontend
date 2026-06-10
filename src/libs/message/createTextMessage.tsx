import { getBackendUrl } from "@/components/utility/setup";
import { ChatMessage, CreateTextMessage } from "../../../interface";

export default async function createTextMessage(
input: CreateTextMessage,
// token: string
):Promise<ChatMessage> {
const response = await fetch(`${getBackendUrl()}/message/createTextMessage/`, {
method: "POST",
cache: "no-store",
headers: {
"Content-Type": "application/json",
// authorization: `Bearer ${token }`,
},
body: JSON.stringify(input),
});
return await response.json()
}