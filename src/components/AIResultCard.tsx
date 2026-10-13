import React from 'react';
import { Sparkles, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { ScanResult } from '../services/api';

interface AIResultCardProps {
  result: ScanResult | null;
  scanError: string | null;
  isScanning: boolean;
  arduinoConnected: boolean;
  onSort: (category: string) => void;
  isSorting: boolean;
  sortMessage: string | null;
}

export const AIResultCard: React.FC<AIResultCardProps> = ({
  result,
  scanError,
  isScanning,
  arduinoConnected,
  onSort,
  isSorting,
  sortMessage,
}) => {
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'paper':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'plastic':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'organic':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col justify-between h-full">
      <div>
        {/* Card Header matching reference */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🧠</span>
            <h2 className="font-bold text-slate-900 text-sm">AI Result</h2>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
            AI READY
          </span>
        </div>

        {/* Content States matching reference screenshot */}
        {isScanning ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-semibold text-slate-800">Analyzing frame with Groq AI...</p>
          </div>
        ) : !result ? (
          <div className="py-6 px-4 flex flex-col items-center justify-center text-center bg-slate-50/70 border border-slate-200/80 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mb-2 shadow-xs">
              <span className="text-xl">♻️</span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-base tracking-wide mb-2">READY TO SCAN</h3>
            
            <div className="w-full space-y-1 mb-3 text-left">
              <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                <span>Confidence:</span>
                <span className="font-mono">—</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="w-0 h-full bg-slate-400"></div>
              </div>
            </div>

            <div className={`w-full p-2.5 rounded-xl text-xs font-medium text-center ${
              scanError
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-sky-50 border border-sky-100 text-sky-900'
            }`}>
              {scanError || <>Place an item in the camera and click <strong>Scan Waste</strong>.</>}
            </div>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Detected Item</span>
                <span className="text-sm font-bold text-slate-900 capitalize">
                  {result.item || 'Unknown Item'}
                </span>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border capitalize ${getCategoryColor(result.category)}`}>
                {result.category}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium text-[11px]">Confidence Score</span>
                <span className="font-mono font-semibold text-slate-900 text-xs">
                  {typeof result.confidence_percent === 'number'
                    ? `${result.confidence_percent.toFixed(1)}%`
                    : `${result.confidence_percent}%`}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    result.accepted ? 'bg-emerald-600' : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${
                      typeof result.confidence_percent === 'number'
                        ? result.confidence_percent
                        : parseFloat(String(result.confidence_percent)) || 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-100 text-[11px] text-slate-700 leading-relaxed">
              <span className="font-semibold text-teal-900 block mb-0.5">AI Reasoning</span>
              {result.reason || 'No detailed reasoning provided.'}
            </div>

            {!result.accepted && (
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>Confidence below threshold. Sorting disabled.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Current Action Section matching reference screenshot */}
      <div className="mt-3 pt-3 border-t border-slate-200/80">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs">⚙️</span>
          <span className="font-bold text-xs text-slate-900">Current Action</span>
        </div>
        <div className="text-xs font-semibold text-slate-800">
          {isScanning ? 'Analyzing waste item...' : result ? (result.accepted ? `Ready to sort (${result.category})` : 'Low confidence item') : 'Waiting for scan'}
        </div>
        <div className="text-[11px] text-slate-500">
          {isScanning ? 'Groq AI processing image' : 'System is ready'}
        </div>

        {result && result.accepted && (
          <div className="mt-2">
            <button
              onClick={() => onSort(result.category)}
              disabled={isSorting || !arduinoConnected}
              className={`w-full py-2 px-3 font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 ${
                arduinoConnected
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSorting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Moving Flap to {result.category}...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Move flap to {result.category} bin
                </>
              )}
            </button>
            {sortMessage && (
              <div className="mt-1.5 p-1.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-medium text-center">
                {sortMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
