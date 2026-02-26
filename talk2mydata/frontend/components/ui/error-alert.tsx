import { AlertCircle } from "lucide-react";

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
      <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
      <p className="text-sm text-destructive whitespace-pre-wrap">{message}</p>
    </div>
  );
}
