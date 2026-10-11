"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed.");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#111113] border border-zinc-800 rounded-sm p-8 sm:p-10 shadow-2xl space-y-8 animate-scale-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-sm border border-zinc-700 bg-zinc-900 mx-auto flex items-center justify-center text-editorial-gold mb-4">
            <Camera className="w-6 h-6 stroke-[1.5]" />
          </div>
          <span className="text-[10px] uppercase tracking-ultra text-editorial-gold font-medium">
            Management Portal
          </span>
          <h1 className="text-2xl font-serif text-white font-medium">
            ADU99 Studio Portal
          </h1>
          <p className="text-xs text-zinc-400">
            Sign in to access schedule, bookings, clients, and financial controls.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-950/40 border border-red-800 rounded-sm text-xs text-red-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@adu99photography.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isLoading}
            >
              <Lock className="w-4 h-4 mr-2" />
              <span>Sign In to Dashboard</span>
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t border-zinc-800/80 text-center">
          <p className="text-[11px] text-zinc-500">
            Protected area. Authorized administrative personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
