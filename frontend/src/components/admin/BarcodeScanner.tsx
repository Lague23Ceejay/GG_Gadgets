import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/Button";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const containerId = "barcode-scanner-region";
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          onScan(decodedText);
        },
        undefined
      )
      .catch(() => {
        // Camera permission denied or unavailable — the admin can still
        // type the barcode in manually, this is purely a convenience layer.
      });

    return () => {
      scanner.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-4 dark:bg-zinc-900">
        <p className="mb-2 text-sm font-medium">Point the camera at a barcode</p>
        <div id={containerId} className="overflow-hidden rounded-lg" />
        <p className="mt-2 text-xs text-zinc-500">
          If the barcode is damaged or unreadable, close this and type the number in manually.
        </p>
        <Button variant="secondary" className="mt-3 w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}