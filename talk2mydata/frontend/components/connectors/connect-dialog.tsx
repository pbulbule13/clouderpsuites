"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { apiClient, API_URL } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import {
  ACCEPT_ATTR,
  MAX_UPLOAD_BYTES,
  formatBytes,
  isAllowedFile,
} from "@/lib/file-types";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";

interface DiscoveredSheet {
  id: string;
  name: string;
  description: string;
  row_count: number;
  columns: string[];
}

interface ConnectDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Mode = "url" | "file";
type Step = "input" | "select" | "loading";

export function ConnectDialog({ open, onClose, onSuccess }: ConnectDialogProps) {
  const [mode, setMode] = useState<Mode>("url");
  const [step, setStep] = useState<Step>("input");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [sheets, setSheets] = useState<DiscoveredSheet[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setMode("url");
    setStep("input");
    setUrl("");
    setFile(null);
    setDragActive(false);
    setSheets([]);
    setSelectedSheets([]);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setStep("input");
    setError("");
  };

  // --- URL flow (Google Sheets) ---

  const handleDiscover = async () => {
    setStep("loading");
    setError("");
    try {
      const result = await apiClient.post<{ datasets: DiscoveredSheet[] }>(
        "/api/v1/connectors/discover",
        {
          name: "Google Sheet",
          connector_type: "google_sheets",
          settings: { url },
        }
      );
      setSheets(result.datasets);
      setSelectedSheets(result.datasets.map((s) => s.id));
      setStep("select");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to access the spreadsheet"
      );
      setStep("input");
    }
  };

  const handleImport = async () => {
    setStep("loading");
    try {
      await apiClient.post("/api/v1/connectors/connect", {
        name: "Google Sheet",
        connector_type: "google_sheets",
        settings: { url },
        selected_sheets: selectedSheets,
      });
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Import failed");
      setStep("select");
    }
  };

  const toggleSheet = (id: string) => {
    setSelectedSheets((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // --- File flow (CSV / Excel / JSON / Parquet) ---

  const pickFile = (selected: File | null) => {
    setError("");
    if (!selected) return;
    if (!isAllowedFile(selected.name)) {
      setError(
        `Unsupported file type. Accepted: ${ACCEPT_ATTR.replace(/\./g, " .")}`
      );
      return;
    }
    if (selected.size > MAX_UPLOAD_BYTES) {
      setError(
        `File is too large (${formatBytes(selected.size)}). Maximum is 10 MB.`
      );
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStep("loading");
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", file.name);
      fd.append("file", file);

      const res = await fetch(`${API_URL}/api/v1/connectors/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.message || body.detail || body.error || "Upload failed"
        );
      }

      onSuccess();
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStep("input");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    pickFile(e.dataTransfer.files?.[0] ?? null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-card border rounded-xl shadow-xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Connect Data Source</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode toggle */}
        {step !== "select" && (
          <div className="flex rounded-lg border p-1 mb-4 text-sm">
            <button
              onClick={() => switchMode("url")}
              className={`flex-1 rounded-md py-1.5 transition-colors ${
                mode === "url"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              Google Sheets URL
            </button>
            <button
              onClick={() => switchMode("file")}
              className={`flex-1 rounded-md py-1.5 transition-colors ${
                mode === "file"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              Upload File
            </button>
          </div>
        )}

        {/* URL input step */}
        {mode === "url" && step === "input" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Google Sheets URL
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste the URL of your Google Sheet. Make sure it&apos;s shared
                with our service account or set to &quot;Anyone with the
                link&quot;.
              </p>
            </div>
            {error && <ErrorAlert message={error} />}
            <Button onClick={handleDiscover} disabled={!url} fullWidth>
              Connect
            </Button>
          </div>
        )}

        {/* File upload step */}
        {mode === "file" && step === "input" && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 cursor-pointer transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "hover:bg-muted"
              }`}
            >
              {file ? (
                <>
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm">
                    Drag a file here, or click to browse
                  </span>
                  <span className="text-xs text-muted-foreground">
                    CSV, Excel, JSON, or Parquet &middot; max 10 MB
                  </span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_ATTR}
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            {error && <ErrorAlert message={error} />}
            <Button onClick={handleUpload} disabled={!file} fullWidth>
              Import File
            </Button>
          </div>
        )}

        {/* Sheet selection step (URL flow only) */}
        {step === "select" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select sheets to import:
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sheets.map((sheet) => (
                <label
                  key={sheet.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSheets.includes(sheet.id)}
                    onChange={() => toggleSheet(sheet.id)}
                    className="rounded border-border"
                  />
                  <span className="text-sm flex-1">{sheet.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {sheet.row_count?.toLocaleString()} rows
                  </span>
                </label>
              ))}
            </div>
            {error && <ErrorAlert message={error} />}
            <Button
              onClick={handleImport}
              disabled={selectedSheets.length === 0}
              fullWidth
            >
              Import Selected Sheets
            </Button>
          </div>
        )}

        {/* Loading step */}
        {step === "loading" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Importing data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
