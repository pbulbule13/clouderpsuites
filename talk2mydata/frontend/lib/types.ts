export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  sql?: string;
  data?: {
    columns: string[];
    rows: Record<string, unknown>[];
    total_rows: number;
    truncated: boolean;
  };
  chart?: {
    config: ChartConfig;
    rows: Record<string, unknown>[];
  };
  error?: boolean;
}

export interface ChartConfig {
  type: "bar" | "line" | "pie" | "table";
  x_axis: string;
  y_axis: string;
  title: string;
}

export interface Dataset {
  id: string;
  name: string;
  table_name: string;
  source_type: string;
  source_url: string;
  row_count: number | null;
  columns: ColumnSchema[];
  status: string;
}

export interface ColumnSchema {
  name: string;
  type: string;
  original_name: string;
}
