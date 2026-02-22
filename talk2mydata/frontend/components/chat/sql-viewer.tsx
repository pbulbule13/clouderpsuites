"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Code2, Copy, Check } from "lucide-react";

interface SQLViewerProps {
  sql: string;
}

export function SQLViewer({ sql }: SQLViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <Code2 className="h-3 w-3" />
        <span>SQL Query</span>
      </button>

      {expanded && (
        <div className="relative bg-muted/30 px-3 py-2 border-t">
          <pre className="text-xs overflow-x-auto whitespace-pre-wrap font-mono">
            {sql}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1 rounded hover:bg-muted transition-colors"
            aria-label="Copy SQL"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
