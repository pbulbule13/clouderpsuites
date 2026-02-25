"use client";

import { useState } from "react";
import { Loader2, X, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";

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

export function ConnectDialog({ open, onClose, onSuccess }: ConnectDialogProps) {
  const [url, setUrl] = useState("");
  const [step, setStep] = useState<"url" | "select" | "loading">("url");
  const [sheets, setSheets] = useState<DiscoveredSheet[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [error, setError] = useState("");

  const reset = () => {
    setUrl("");
    setStep("url");
    setSheets([]);
    setSelectedSheets([]);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

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
      setError(err instanceof Error ? err.message : "Failed to access the spreadsheet");
      setStep("url");
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
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "url" && (
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
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive whitespace-pre-wrap">{error}</p>
              </div>
            )}
            <button
              onClick={handleDiscover}
              disabled={!url}
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              Connect
            </button>
          </div>
        )}

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
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive whitespace-pre-wrap">{error}</p>
              </div>
            )}
            <button
              onClick={handleImport}
              disabled={selectedSheets.length === 0}
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              Import Selected Sheets
            </button>
          </div>
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Importing data...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
