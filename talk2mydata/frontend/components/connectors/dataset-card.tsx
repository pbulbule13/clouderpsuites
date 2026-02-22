"use client";

import { useRouter } from "next/navigation";
import { MessageSquare, RefreshCw, Trash2, Table2 } from "lucide-react";
import type { Dataset } from "@/lib/types";
import { apiClient } from "@/lib/api-client";

interface DatasetCardProps {
  dataset: Dataset;
  onRefresh: () => void;
  onDelete: () => void;
}

export function DatasetCard({ dataset, onRefresh, onDelete }: DatasetCardProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete "${dataset.name}"? This will remove the data permanently.`)) return;
    await apiClient.delete(`/api/v1/datasets/${dataset.id}`);
    onDelete();
  };

  const handleRefresh = async () => {
    await apiClient.post(`/api/v1/datasets/${dataset.id}/refresh`);
    onRefresh();
  };

  return (
    <div className="bg-card border rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Table2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{dataset.name}</h3>
            <p className="text-xs text-muted-foreground">
              {dataset.source_type} &middot; {dataset.row_count?.toLocaleString()} rows &middot; {dataset.columns.length} columns
            </p>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            dataset.status === "ready"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
          }`}
        >
          {dataset.status}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => router.push(`/chat/${dataset.id}`)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          Chat
        </button>
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg border hover:bg-muted transition-colors"
          aria-label="Refresh data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 rounded-lg border hover:bg-destructive/10 text-destructive transition-colors"
          aria-label="Delete dataset"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
