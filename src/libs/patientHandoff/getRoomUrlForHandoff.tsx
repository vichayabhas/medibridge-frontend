import { getBackendUrl } from "@/components/utility/setup";

export default async function getRoomUrlForHandoff(
id:string,
// token: string
) {
const response = await fetch(`${getBackendUrl()}/patientHandoff/getRoomUrlForHandoff/${id}`, {
cache: "no-store",
headers: {
"Content-Type": "application/json",
// authorization: `Bearer ${token }`,
},
});
return await response.json()
}