import React, { useState } from 'react';
import { Recycle, Settings } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

interface HeaderProps {
  apiOnline: boolean;
  onRefreshHealth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ apiOnline, onRefreshHealth }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">SmartSort</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">AI-Based Smart Waste Segregation System</p>
            </div>
          </div>

          {/* Right Action Zone */}
          <div className="flex items-center gap-3">
            {/* API Status Badge matching reference */}
            <div
              onClick={onRefreshHealth}
              title="Click to re-check backend connection"
              className={`cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                apiOnline
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                  : 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`} />
              <span>{apiOnline ? 'System Online' : 'Backend Offline'}</span>
            </div>

            {/* Settings button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Backend Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={onRefreshHealth}
      />
    </>
  );
};
