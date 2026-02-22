"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import type { Dataset } from "@/lib/types";
import { DatasetCard } from "@/components/connectors/dataset-card";
import { ConnectDialog } from "@/components/connectors/connect-dialog";

export default function DashboardPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadDatasets = useCallback(async () => {
    try {
      const res = await apiClient.get<{ datasets: Dataset[] }>(
        "/api/v1/datasets"
      );
      setDatasets(res.datasets);
    } catch {
      // Will be handled by API client redirect
    }
  }, []);

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Your Datasets</h2>
          <p className="text-muted-foreground">
            Connect data sources and start asking questions.
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Connect Data Source
        </button>
      </div>

      {datasets.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <div className="text-4xl mb-4">&#128202;</div>
          <h3 className="text-lg font-semibold mb-2">No datasets yet</h3>
          <p className="text-muted-foreground mb-4">
            Connect a Google Sheet to start asking questions about your data.
          </p>
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Connect Your First Dataset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {datasets.map((ds) => (
            <DatasetCard
              key={ds.id}
              dataset={ds}
              onRefresh={loadDatasets}
              onDelete={loadDatasets}
            />
          ))}
        </div>
      )}

      <ConnectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={loadDatasets}
      />
    </div>
  );
}
