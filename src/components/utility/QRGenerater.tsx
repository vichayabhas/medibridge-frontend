"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";

// Define the "input" to this component
interface QRGeneratorProps {
  attendanceId: string; 
}

export default function QRGenerator({ attendanceId }: QRGeneratorProps) {
  // If no ID is provided yet, show a loading state or nothing
  if (!attendanceId) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 min-h-[250px]">
        <p className="text-gray-500 font-medium">Waiting for Attendance ID...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Scan to Check In</h2>
      
      <div className="flex flex-col items-center p-4 border-2 border-gray-100 rounded-lg bg-gray-50">
        {/* Generates the QR Code based on the prop */}
        <QRCodeSVG 
          value={attendanceId} 
          size={250}
          level="H" // High error correction
        //   includeMargin={true}
        />
        <p className="mt-4 text-sm text-gray-500 font-mono break-all text-center">
          ID: {attendanceId}
        </p>
      </div>
    </div>
  );
}