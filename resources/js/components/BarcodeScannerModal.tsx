import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, AlertCircle } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  const onCloseRef = useRef(onClose);
  const onScanSuccessRef = useRef(onScanSuccess);
  onCloseRef.current = onClose;
  onScanSuccessRef.current = onScanSuccess;

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    let isRunning = false;
    let scanner: Html5Qrcode | null = null;
    const elementId = 'barcode-reader-viewport';

    setCameraError(null);
    setIsStarting(true);

    const stopSafely = async () => {
      if (scanner && isRunning) {
        isRunning = false;
        try {
          await scanner.stop();
        } catch {
          // Ignorar si ya estaba detenido
        }
      }
      if (scanner) {
        try {
          scanner.clear();
        } catch {
          // Ignorar limpieza si el nodo ya no existe
        }
        scanner = null;
      }
    };

    const startScanner = async () => {
      try {
        const container = document.getElementById(elementId);
        if (!container || cancelled) return;

        scanner = new Html5Qrcode(elementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
        });

        let cameraConfig: string | { facingMode: string } = { facingMode: 'environment' };
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            const backCam = devices.find((d) =>
              /back|rear|trasera|environment/i.test(d.label)
            );
            cameraConfig = backCam ? backCam.id : devices[0].id;
          }
        } catch {
          // Fallback a facingMode: environment
        }

        if (cancelled) return;

        await scanner.start(
          cameraConfig,
          {
            fps: 10,
            qrbox: { width: 250, height: 140 },
          },
          async (decodedText) => {
            if (cancelled) return;
            cancelled = true;
            await stopSafely();
            onScanSuccessRef.current(decodedText.trim());
            onCloseRef.current();
          },
          () => {
            // Ignora frames sin código
          }
        );

        if (cancelled) {
          isRunning = true;
          await stopSafely();
          return;
        }

        isRunning = true;
        setIsStarting(false);
      } catch (err: any) {
        if (cancelled) return;
        setIsStarting(false);
        const msg = String(err?.message || err || '');
        if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
          setCameraError('Permiso de cámara denegado. Habilita el acceso a la cámara en tu navegador o dispositivo.');
        } else if (msg.includes('NotFoundError')) {
          setCameraError('No se detectó ninguna cámara disponible en este dispositivo.');
        } else {
          setCameraError('No se pudo iniciar la cámara. En navegadores móviles recuerda acceder mediante HTTPS o desde la app APK.');
        }
      }
    };

    const timer = setTimeout(startScanner, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      void stopSafely();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-stone-900">Escanear Código de Barras</h3>
              <p className="text-[11px] text-stone-500">Apunta la cámara al código del producto</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 text-stone-500 flex items-center justify-center border border-stone-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Cámara */}
        <div className="p-4 bg-stone-950">
          {cameraError ? (
            <div className="p-5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-100 text-xs flex flex-col items-center text-center gap-2">
              <AlertCircle className="w-7 h-7 text-rose-400" />
              <p className="font-semibold">{cameraError}</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-black min-h-[240px] flex items-center justify-center">
              {isStarting && (
                <span className="text-xs text-stone-300 animate-pulse absolute">
                  Iniciando cámara...
                </span>
              )}
              <div id="barcode-reader-viewport" className="w-full" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">EAN-13 • UPC • Code-128 • QR</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};