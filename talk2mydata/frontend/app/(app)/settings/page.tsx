"use client";

import { getUser } from "@/lib/auth";
import { useTheme } from "@/components/layout/theme-provider";

export default function SettingsPage() {
  const user = getUser();
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="space-y-6">
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-3">Account</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-3">Appearance</h3>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                  theme === t
                    ? "bg-primary text-primary-foreground"
                    : "border hover:bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
