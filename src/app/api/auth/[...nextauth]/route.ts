import NextAuth from "next-auth";
import { authOptions } from "./options"; // Adjust the path if you put it elsewhere

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };