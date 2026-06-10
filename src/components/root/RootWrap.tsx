"use client";

import { usePathname } from "next/navigation";
import React, { Suspense } from "react";
import { AuthUser } from "../../../interface";
// import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";
import LineFAB from "./LineFAB";
import { Toaster } from "sonner";
import Navbar from "./Navbar";
function PageLoader() {
  return null;
}
const FULL_HEIGHT_ROUTES = ["/nearby", "/consult"];
const BARE_ROUTES = [
  "/login",
  "/register",
  "/pharmacy-role",
  "/pharmacist-role",
  "/call",
  "/pharmacy-dashboard",
];
export default function RootWrap({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AuthUser|null;
}) {
  const location = usePathname();
  const isBare = BARE_ROUTES.includes(location);
  const isFullHeight = FULL_HEIGHT_ROUTES.includes(location);

  const isSpecialRole =
    user?.role === "pharmacist" ||
    user?.role === "admin" ||
    user?.role === "pharmacy_admin";

  return (
    <>
      {!isBare && <Navbar user={user} />}
      <main>
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </main>
      {!isBare && !isFullHeight && <Footer />}
      {!isBare && <BottomNav user={user}/>}
      {!isBare && !isSpecialRole && <ChatWidget />}
      {!isBare && <LineFAB />}
      <Toaster richColors position="top-right" />
    </>
  );
}
