import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { InstructionStrip } from './components/InstructionStrip';
import { CameraCard } from './components/CameraCard';
import { AIResultCard } from './components/AIResultCard';
import { RightColumnCards } from './components/RightColumnCards';
import { BackendResponseError, checkHealth, checkStatus, scanWaste, sortWaste, ScanResult, SystemStatus } from './services/api';

export default function App() {
  const [apiOnline, setApiOnline] = useState<boolean>(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [sortMessage, setSortMessage] = useState<string | null>(null);
  const [isSorted, setIsSorted] = useState<boolean>(false);

  const refreshHealth = useCallback(async () => {
    try {
      const health = await checkHealth();
      setApiOnline(health.ok);
    } catch {
      setApiOnline(false);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const status = await checkStatus();
      setSystemStatus(status);
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    refreshHealth();
    refreshStatus();

    const interval = setInterval(() => {
      refreshStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [refreshHealth, refreshStatus]);

  const handleScanFrame = async (base64Image: string) => {
    setIsScanning(true);
    setScanResult(null);
    setScanError(null);
    setSortMessage(null);
    setIsSorted(false);

    try {
      const result = await scanWaste(base64Image);
      setScanResult(result);
      setApiOnline(true);
    } catch (err: any) {
      console.error('Scan error:', err);
      setApiOnline(err instanceof BackendResponseError);
      setScanError(err?.message || 'Scan failed. Check the backend and Groq API configuration.');
      setScanResult(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSort = async (category: string) => {
    setIsSorting(true);
    setSortMessage(null);

    try {
      const resp = await sortWaste(category);
      setSortMessage(resp.message || `Flap moved to ${category} bin!`);
      setIsSorted(true);
    } catch (err: any) {
      console.error('Sort error:', err);
      setSortMessage(err?.message || 'Sort command failed. Check the Arduino connection.');
      setIsSorted(false);
    } finally {
      setIsSorting(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f4fbf7] text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Header matching reference screenshot */}
      <Header apiOnline={apiOnline} onRefreshHealth={() => { refreshHealth(); refreshStatus(); }} />

      {/* Instruction Strip matching reference screenshot */}
      <InstructionStrip />

      {/* Main Dashboard Body - Strictly fitted in 1 screen with zero vertical scroll */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-2 flex flex-col justify-center overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch h-full py-1">
          {/* Left Column: Live Camera Feed */}
          <div className="h-full">
            <CameraCard onScanFrame={handleScanFrame} isScanning={isScanning} />
          </div>

          {/* Center Column: AI Result */}
          <div className="h-full">
            <AIResultCard
              result={scanResult}
              scanError={scanError}
              isScanning={isScanning}
              arduinoConnected={systemStatus?.arduino_connected ?? true}
              onSort={handleSort}
              isSorting={isSorting}
              sortMessage={sortMessage}
            />
          </div>

          {/* Right Column: Arduino Status & System Process */}
          <div className="h-full">
            <RightColumnCards
              status={systemStatus}
              isLoadingStatus={isLoadingStatus}
              onRefreshStatus={refreshStatus}
              isScanning={isScanning}
              hasResult={!!scanResult}
              isSorted={isSorted}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
