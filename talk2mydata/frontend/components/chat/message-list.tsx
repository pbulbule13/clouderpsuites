import { Loader2 } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { DataTable } from "./data-table";
import { ChartRenderer } from "./chart-renderer";
import { SQLViewer } from "./sql-viewer";

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] space-y-3 ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3"
                : "space-y-3"
            }`}
          >
            {/* Thinking indicator */}
            {msg.thinking && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                {msg.thinking}
              </div>
            )}

            {/* SQL viewer */}
            {msg.sql && <SQLViewer sql={msg.sql} />}

            {/* Data table */}
            {msg.data && msg.data.rows?.length > 0 && (
              <DataTable
                columns={msg.data.columns}
                rows={msg.data.rows}
                totalRows={msg.data.total_rows}
                truncated={msg.data.truncated}
              />
            )}

            {/* Natural language answer */}
            {msg.content && (
              <div
                className={`prose prose-sm max-w-none ${msg.error ? "text-destructive" : ""}`}
              >
                {msg.content}
              </div>
            )}

            {/* Chart */}
            {msg.chart && (
              <ChartRenderer
                config={msg.chart.config}
                data={msg.chart.rows}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
