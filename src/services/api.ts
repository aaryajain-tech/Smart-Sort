/**
 * SmartSort API Service
 * Communicates with the FastAPI backend.
 */

export interface SystemStatus {
  api?: string;
  ai_configured: boolean;
  arduino_connected: boolean;
  arduino_port: string | null;
  servo_ready: boolean;
  mode: string;
}

export interface ScanResult {
  category: string;
  confidence: number;
  confidence_percent: number | string;
  item: string;
  reason: string;
  accepted: boolean;
  threshold: number;
  arduino_connected: boolean;
  message?: string;
}

export interface SortResponse {
  success: boolean;
  message: string;
  category?: string;
  port?: string;
}

export class BackendResponseError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'BackendResponseError';
  }
}

const DEFAULT_BACKEND_URL = 'http://127.0.0.1:8000';

export function getBackendUrl(): string {
  const saved = localStorage.getItem('smartsort_backend_url');
  return saved || DEFAULT_BACKEND_URL;
}

export function setBackendUrl(url: string): void {
  localStorage.setItem('smartsort_backend_url', url.trim().replace(/\/$/, ''));
}

export async function checkHealth(): Promise<{ ok: boolean; service?: string }> {
  const baseUrl = getBackendUrl();
  const res = await fetch(`${baseUrl}/api/health`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }
  return res.json();
}

export async function checkStatus(): Promise<SystemStatus> {
  const baseUrl = getBackendUrl();
  const res = await fetch(`${baseUrl}/api/status`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Status check failed with status ${res.status}`);
  }
  return res.json();
}

export async function scanWaste(imageBase64: string, mimeType = 'image/jpeg'): Promise<ScanResult> {
  const baseUrl = getBackendUrl();
  const res = await fetch(`${baseUrl}/api/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      image: imageBase64,
      mime_type: mimeType,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new BackendResponseError(
      data.detail || data.message || `Scan failed with status ${res.status}`,
      res.status,
    );
  }
  return data;
}

export async function sortWaste(category: string): Promise<SortResponse> {
  const baseUrl = getBackendUrl();
  const res = await fetch(`${baseUrl}/api/sort`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ category }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new BackendResponseError(
      data.detail || data.message || `Sort actuation failed with status ${res.status}`,
      res.status,
    );
  }
  return data;
}
