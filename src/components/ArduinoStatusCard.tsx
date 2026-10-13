import React from 'react';
import { Cpu, HardDrive, CheckCircle2, XCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { SystemStatus } from '../services/api';

interface ArduinoStatusCardProps {
  status: SystemStatus | null;
  isLoadingStatus: boolean;
  onRefreshStatus: () => void;
}

export const ArduinoStatusCard: React.FC<ArduinoStatusCardProps> = ({
  status,
  isLoadingStatus,
  onRefreshStatus,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-sm">Arduino & System</h2>
              <p className="text-[11px] text-slate-500">Hardware telemetry & backend process</p>
            </div>
          </div>
          <button
            onClick={onRefreshStatus}
            disabled={isLoadingStatus}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Arduino Connection Status Badge Box */}
        <div
          className={`p-3 rounded-xl border mb-3 flex items-center justify-between ${
            status?.arduino_connected
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {status?.arduino_connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-slate-400 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold">
                {status?.arduino_connected ? 'Arduino Connected' : 'Arduino Not Connected'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Port: {status?.arduino_port || 'None'}
              </div>
            </div>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
              status?.arduino_connected ? 'bg-emerald-200/70 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {status?.arduino_connected ? 'Active' : 'Offline'}
          </span>
        </div>

        {/* System Process Telemetry Table */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-600 font-medium text-[11px] flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              Groq API Configured
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                status?.ai_configured ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {status?.ai_configured ? 'Configured' : 'Not Configured'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-600 font-medium text-[11px]">Servo Ready</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                status?.servo_ready ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {status?.servo_ready ? 'Ready' : 'Not Ready'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-600 font-medium text-[11px]">System Mode</span>
            <span className="font-mono font-semibold text-slate-800 uppercase text-[11px]">
              {status?.mode || 'standard'}
            </span>
          </div>
        </div>
      </div>

      {/* Connection Help Note */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[10px] leading-relaxed flex items-start gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-700 block mb-0.5">Connection Help:</span>
            Requires USB connection and matching Arduino sketch.
          </div>
        </div>
      </div>
    </div>
  );
};
