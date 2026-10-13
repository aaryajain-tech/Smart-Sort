import React from 'react';

export const InstructionStrip: React.FC = () => {
  return (
    <div className="bg-[#eaf5ed] border border-[#cbe6d2] text-[#1e462b] py-2 px-4 sm:px-6 rounded-xl mx-4 sm:mx-6 my-2 shrink-0 text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-bold flex items-center gap-1 text-emerald-800">
          <span>💡</span> Try SmartSort!
        </span>
        <span className="text-slate-400 hidden sm:inline">|</span>
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-700">
          <span>1. Place waste in camera</span>
          <span className="text-emerald-600 font-bold">›</span>
          <span>2. Click Scan Waste</span>
          <span className="text-emerald-600 font-bold">›</span>
          <span>3. Watch AI identify it</span>
          <span className="text-emerald-600 font-bold">›</span>
          <span>4. It goes to the correct bin!</span>
        </div>
      </div>
    </div>
  );
};
