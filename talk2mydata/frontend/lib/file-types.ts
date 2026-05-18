// Supported upload formats. Mirrored on the backend in
// app/connectors/adapters/_file_utils.py (EXTENSION_MAP).

export const ALLOWED_EXTENSIONS = [
  ".csv",
  ".tsv",
  ".xlsx",
  ".xls",
  ".json",
  ".ndjson",
  ".parquet",
] as const;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

/** Value for an <input type="file"> accept attribute. */
export const ACCEPT_ATTR = ALLOWED_EXTENSIONS.join(",");

export function fileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

export function isAllowedFile(filename: string): boolean {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(
    fileExtension(filename)
  );
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
