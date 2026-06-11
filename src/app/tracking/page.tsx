import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/options";
import TrackingPage from "@/components/tracking/TrackingPage";
export default async function page() {
  const session = await getServerSession(authOptions);
  return <TrackingPage session={session} />;
}
