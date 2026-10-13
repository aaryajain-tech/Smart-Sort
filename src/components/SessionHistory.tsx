import React from 'react';
import { History, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export interface SessionScanItem {
  id: string;
  timestamp: string;
  item: string;
  category: string;
  confidence: number;
  accepted: boolean;
  sorted?: boolean;
}

interface SessionHistoryProps {
  scans: SessionScanItem[];
  onClearHistory: () => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ scans, onClearHistory }) => {
  const totalCount = scans.length;
  const paperCount = scans.filter((s) => s.category.toLowerCase() === 'paper' && s.accepted).length;
  const plasticCount = scans.filter((s) => s.category.toLowerCase() === 'plastic' && s.accepted).length;
  const organicCount = scans.filter((s) => s.category.toLowerCase() === 'organic' && s.accepted).length;
  const otherCount = totalCount - (paperCount + plasticCount + organicCount);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-3.5">
      <div className="flex items-center justify-between gap-4 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-xs">Session Segregation Counters & Log</h2>
          </div>
        </div>

        {scans.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors flex items-center gap-1 border border-slate-200"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-5 gap-2 mb-2.5">
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-center">
          <div className="text-[10px] text-slate-500 font-medium">Total</div>
          <div className="text-sm font-bold font-mono text-slate-900">{totalCount}</div>
        </div>
        <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/70 text-center">
          <div className="text-[10px] text-amber-800 font-medium">Paper</div>
          <div className="text-sm font-bold font-mono text-amber-900">{paperCount}</div>
        </div>
        <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-200/70 text-center">
          <div className="text-[10px] text-blue-800 font-medium">Plastic</div>
          <div className="text-sm font-bold font-mono text-blue-900">{plasticCount}</div>
        </div>
        <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-center">
          <div className="text-[10px] text-emerald-800 font-medium">Organic</div>
          <div className="text-sm font-bold font-mono text-emerald-900">{organicCount}</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-center">
          <div className="text-[10px] text-slate-600 font-medium">Other</div>
          <div className="text-sm font-bold font-mono text-slate-800">{otherCount}</div>
        </div>
      </div>

      {/* Scans Table / Log - compact max height */}
      {scans.length === 0 ? (
        <div className="text-center py-2 text-slate-400 text-[11px] border border-dashed border-slate-200 rounded-lg bg-slate-50/30">
          No items scanned yet in this session.
        </div>
      ) : (
        <div className="max-h-24 overflow-y-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium sticky top-0 bg-white">
                <th className="py-1 px-2">Time</th>
                <th className="py-1 px-2">Item</th>
                <th className="py-1 px-2">Category</th>
                <th className="py-1 px-2">Confidence</th>
                <th className="py-1 px-2">Status</th>
                <th className="py-1 px-2">Sort</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {scans.map((scan) => (
                <tr key={scan.id} className="hover:bg-slate-50/80">
                  <td className="py-1 px-2 font-mono text-slate-500">{scan.timestamp}</td>
                  <td className="py-1 px-2 font-semibold text-slate-900">{scan.item}</td>
                  <td className="py-1 px-2 capitalize">
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-800">{scan.category}</span>
                  </td>
                  <td className="py-1 px-2 font-mono">{(scan.confidence * 100).toFixed(1)}%</td>
                  <td className="py-1 px-2">
                    {scan.accepted ? (
                      <span className="text-emerald-700 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> OK
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-0.5">
                        <XCircle className="w-3 h-3" /> Low
                      </span>
                    )}
                  </td>
                  <td className="py-1 px-2">
                    {scan.sorted ? <span className="text-emerald-700">Sorted</span> : <span className="text-slate-400">Pending</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
