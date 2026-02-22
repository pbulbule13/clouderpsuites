interface DataTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  truncated: boolean;
}

export function DataTable({
  columns,
  rows,
  totalRows,
  truncated,
}: DataTableProps) {
  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="overflow-x-auto max-h-80">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-t hover:bg-muted/30 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2 whitespace-nowrap">
                    {String(row[col] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {truncated && (
        <div className="bg-muted/30 px-3 py-2 text-xs text-muted-foreground text-center border-t">
          Showing {rows.length} of {totalRows.toLocaleString()} rows
        </div>
      )}
    </div>
  );
}
