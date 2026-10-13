import React, { useRef, useState, useEffect } from 'react';
import { Camera, VideoOff, Sparkles, Upload, AlertCircle } from 'lucide-react';

interface CameraCardProps {
  onScanFrame: (base64Image: string) => void;
  isScanning: boolean;
}

export const CameraCard: React.FC<CameraCardProps> = ({ onScanFrame, isScanning }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
      } catch {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMessage(
        'Permission denied or camera restricted in iframe. Use "Upload photo" or "Load sample item" below.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleScanClick = () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const maxWidth = 1024;
    let width = video.videoWidth || 640;
    let height = video.videoHeight || 480;

    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onScanFrame(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result) {
        onScanFrame(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSample = () => {
    setErrorMessage('Sample testing is disabled in live hardware mode. Use a real camera frame or upload an actual waste image.');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col justify-between h-full">
      <div>
        {/* Card Header matching reference */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📷</span>
            <h2 className="font-bold text-slate-900 text-sm">Live Camera Feed</h2>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              cameraActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {cameraActive ? '• Camera Ready' : '• Camera Offline'}
          </span>
        </div>

        {/* Mint border box matching reference */}
        <div className="relative w-full h-44 sm:h-52 bg-white rounded-2xl border-2 border-emerald-400 p-2 overflow-hidden flex items-center justify-center shadow-xs">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover rounded-xl ${cameraActive ? 'block' : 'hidden'}`}
          />
          <canvas ref={canvasRef} className="hidden" />

          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-slate-600">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2 text-slate-500 border border-slate-200">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 mb-1">Camera not started</p>
              <p className="text-xs text-slate-500 max-w-xs mb-2">
                Start the camera and scan a real waste item.
              </p>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white z-10">
              <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-xs font-semibold">Analyzing with Groq AI...</p>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls matching reference buttons */}
      <div className="mt-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="w-full py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>📷</span> Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="w-full py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <VideoOff className="w-3.5 h-3.5" /> Stop Camera
            </button>
          )}

          <button
            onClick={handleScanClick}
            disabled={!cameraActive || isScanning}
            className={`w-full py-2.5 px-3 font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 ${
              cameraActive && !isScanning
                ? 'bg-[#10a37f] hover:bg-[#0d8c6d] text-white cursor-pointer shadow-sm'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>🟢</span> Scan Waste
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <button onClick={handleLoadSample} className="text-emerald-700 hover:underline font-medium">
            ⚡ Quick Test Sample
          </button>
          <label htmlFor="upload-file-fallback" className="text-emerald-700 hover:underline cursor-pointer font-medium">
            Upload photo
          </label>
          <input type="file" accept="image/*" id="upload-file-fallback" className="hidden" onChange={handleFileUpload} />
        </div>
      </div>
    </div>
  );
};
