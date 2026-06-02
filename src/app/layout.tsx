import type { Metadata } from "next";
// import "./globals.css"; // Ensure your global styles (or Tailwind) are imported here
import React from "react";

// 1. Move your title, description, and icons to the Metadata API
export const metadata: Metadata = {
  title: "MediBridge — ปรึกษาเภสัชกร ค้นหาร้านยา",
  description: "MediBridge - ปรึกษาเภสัชกรออนไลน์ ค้นหาร้านยาใกล้คุณ",
  icons: {
    icon: "/vite.svg", // Move this file from your Vite public/ folder to Next.js public/ folder
  },
};

// 2. Next.js 14+ extracts viewport configurations into its own export
// export const viewport: Viewport = {
//   themeColor: "#f8fafc",
//   width: "device-width",
//   initialScale: 1,
//   maximumScale: 1,
//   userScalable: false, // equivalent to user-scalable=no
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Your lang="th" goes here
    <html lang="th">
      <head>
        {/* 3. Next.js optimizes Google Fonts automatically. 
            You can keep these preconnect links here manually if preferred, 
            or let Next.js handle it via `next/font` later. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        {/* The {children} replaces your <div id="root"></div> and script tags */}
        {children}
      </body>
    </html>
  );
}