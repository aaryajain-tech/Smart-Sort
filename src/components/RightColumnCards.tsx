import React from 'react';
import { SystemStatus } from '../services/api';

interface RightColumnCardsProps {
  status: SystemStatus | null;
  isLoadingStatus: boolean;
  onRefreshStatus: () => void;
  isScanning: boolean;
  hasResult: boolean;
  isSorted: boolean;
}

export const RightColumnCards: React.FC<RightColumnCardsProps> = ({
  status,
  isLoadingStatus,
  onRefreshStatus,
  isScanning,
  hasResult,
  isSorted,
}) => {
  const arduinoConnected = status?.arduino_connected ?? false;

  // Determine step states based on app state
  const step1 = 'Ready';
  const step2 = isScanning ? 'Analyzing...' : hasResult ? 'Completed' : 'Waiting';
  const step3 = hasResult ? 'Ready' : 'Waiting';
  const step4 = isSorted ? 'Completed' : 'Waiting';
  const step5 = isSorted ? 'Completed' : 'Waiting';

  return (
    <div className="flex flex-col gap-3.5 h-full">
      {/* Top Right: Arduino Status Card matching reference */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">♾️</span>
            <h2 className="font-bold text-slate-900 text-sm">Arduino Status</h2>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              arduinoConnected
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {arduinoConnected ? '• Arduino Connected' : '• Demo / Not Connected'}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Board</span>
            <span className="font-semibold text-slate-900">Arduino Uno</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Connection</span>
            <span className="font-mono text-slate-800 text-[11px]">
              {arduinoConnected ? status?.arduino_port || 'USB Serial' : 'USB / Demo'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500 font-medium">Servo Motor</span>
            <span className="font-semibold text-emerald-700">
              {status?.servo_ready ? 'Ready' : 'Standby'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Right: System Process Card matching reference */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🕒</span>
          <h2 className="font-bold text-slate-900 text-sm">System Process</h2>
        </div>

        <div className="space-y-2 text-xs font-medium text-slate-700">
          <div className="flex items-center justify-between py-1 px-2 rounded bg-emerald-50/70 border border-emerald-100 text-emerald-900">
            <span>1. ✓ Camera Feed — Ready</span>
            <span className="text-[10px] font-bold text-emerald-700">READY</span>
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-50 border border-slate-100">
            <span>2. 2 AI Classification — {step2}</span>
            <span className="text-[10px] text-slate-500">{step2}</span>
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-50 border border-slate-100">
            <span>3. 3 Arduino Command — {step3}</span>
            <span className="text-[10px] text-slate-500">{step3}</span>
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-50 border border-slate-100">
            <span>4. 4 Servo Movement — {step4}</span>
            <span className="text-[10px] text-slate-500">{step4}</span>
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-50 border border-slate-100">
            <span>5. 5 Sorting Complete — {step5}</span>
            <span className="text-[10px] text-slate-500">{step5}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
