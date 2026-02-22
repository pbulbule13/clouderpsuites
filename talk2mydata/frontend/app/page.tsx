"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-2xl mx-auto text-center px-6">
        <div className="mb-8">
          <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4">
            Talk<span className="text-primary">2</span>MyData
          </h1>
          <p className="text-xl text-muted-foreground">
            Connect your data. Ask questions in plain English. Get instant
            answers with charts, tables, and insights.
          </p>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          >
            Get Started
          </a>
          <p className="text-sm text-muted-foreground">
            Powered by Google Gemini AI & BigQuery
          </p>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 text-left">
          <div className="space-y-2">
            <div className="text-2xl">1.</div>
            <h3 className="font-semibold">Connect</h3>
            <p className="text-sm text-muted-foreground">
              Paste a Google Sheets URL to import your data instantly.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-2xl">2.</div>
            <h3 className="font-semibold">Ask</h3>
            <p className="text-sm text-muted-foreground">
              Type any question about your data in plain English.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-2xl">3.</div>
            <h3 className="font-semibold">Discover</h3>
            <p className="text-sm text-muted-foreground">
              Get answers with tables, charts, and natural language explanations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
