import React from "react";
import { FaLine } from "react-icons/fa";

export default function LineFAB() {
  return (
    <div className="fixed bottom-20 left-4 z-50 md:bottom-6 md:left-6 flex flex-col items-start pointer-events-none">
      <a
        href="https://lin.ee/rqFq0fe"
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-[#06C755] shadow-xl shadow-[#06C755]/30 transition-all duration-300 hover:-translate-y-1 hover:scale-110 active:scale-95"
        aria-label="ติดต่อเราทาง LINE"
      >
        <FaLine className="h-8 w-8 text-white" />
      </a>
    </div>
  );
}
