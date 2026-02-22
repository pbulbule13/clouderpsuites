"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MessageSquare, Plus, Table2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import type { Dataset } from "@/lib/types";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  useEffect(() => {
    apiClient
      .get<{ datasets: Dataset[] }>("/api/v1/datasets")
      .then((res) => setDatasets(res.datasets))
      .catch(() => {});
  }, []);

  return (
    <aside className="w-64 border-r bg-card h-full flex flex-col">
      <div className="p-4 border-b">
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Connect Data
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
            Datasets
          </p>
          {datasets.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2 py-4">
              No datasets connected yet.
            </p>
          ) : (
            <nav className="space-y-1">
              {datasets.map((ds) => {
                const isActive = pathname === `/chat/${ds.id}`;
                return (
                  <button
                    key={ds.id}
                    onClick={() => router.push(`/chat/${ds.id}`)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Table2 className="h-4 w-4 shrink-0" />
                    <div className="flex-1 text-left truncate">
                      <div className="truncate">{ds.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {ds.row_count?.toLocaleString()} rows
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </aside>
  );
}
