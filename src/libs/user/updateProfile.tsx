import { getBackendUrl, userPath } from "@/components/utility/setup";
import { AuthUser, UpdateProfile } from "../../../interface";

export default async function updateProfile(
input: UpdateProfile,
token: string
):Promise<AuthUser> {
const response = await fetch(`${getBackendUrl()}/${userPath}/updateProfile/`, {
method: "PUT",
cache: "no-store",
headers: {
"Content-Type": "application/json",
authorization: `Bearer ${token }`,
},
body: JSON.stringify(input),
});
return await response.json()
}