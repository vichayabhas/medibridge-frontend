"use client";

import React  from "react";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";

interface QRScannerProps {
  // Pass the function you want to trigger when a scan is successful
  onScanSuccess: (scannedId: string) => Promise<void> | void;
  text: string;
  checkIn: string;
}

export default function QRScan({
  onScanSuccess,
  text,
  checkIn,
}: QRScannerProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    // Stop if we are already processing a scan or if nothing was detected
    if (isProcessing || detectedCodes.length === 0) return;

    const rawId = detectedCodes[0].rawValue;
    setIsProcessing(true);

    try {
      // Trigger the function passed from the parent component
      await onScanSuccess(rawId);
    } catch (error) {
      console.error("Error processing scan:", error);
    } finally {
      // Wait 2.5 seconds before allowing another scan to prevent spamming
      setTimeout(() => {
        setIsProcessing(false);
      }, 2500);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 w-full max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-4 text-white bg-gray-800 px-4 py-1 rounded-full">
        Scan to Check In {checkIn}
      </h2>

      <div className="w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-800 relative bg-black aspect-square">
        <Scanner
          onScan={handleScan}
          onError={(error) => console.error("Scanner Error:", error)}
          //   components={{
          //     audio: true, // Beeps on success
          //     tracker: true, // Green box around QR
          //   }}
        />

        {/* Overlay showing processing state */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
            <span className="text-white font-bold text-lg animate-pulse">
              Processing...
            </span>
          </div>
        )}
      </div>
      <div>{text}</div>
    </div>
  );
}
