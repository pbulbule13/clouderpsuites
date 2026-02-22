"use client";

import { useRouter } from "next/navigation";
import { LogOut, Moon, Sun, Database } from "lucide-react";
import { clearAuth, getUser } from "@/lib/auth";
import { useTheme } from "./theme-provider";

export function Header() {
  const router = useRouter();
  const user = getUser();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Database className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold">
          Talk<span className="text-primary">2</span>MyData
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
