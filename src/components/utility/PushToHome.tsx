"use client";
import { useRouter } from "next/navigation";
import React from "react";
export default function PushToHome() {
  const router = useRouter();
  router.push("/");
  return <></>;
}
