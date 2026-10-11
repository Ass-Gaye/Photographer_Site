"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Check, X, Calendar, Clock, Trash2, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Rule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface BlockedItem {
  id: string;
  startDate: Date | string;
  endDate: Date | string;
  reason?: string | null;
}

interface AvailabilityManagerProps {
  initialRules: Rule[];
  initialBlocked: BlockedItem[];
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AvailabilityManager({ initialRules, initialBlocked }: AvailabilityManagerProps) {
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [savingDay, setSavingDay] = useState<number | null>(null);

  // New blocked date state
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);

  const handleUpdateRule = async (dayOfWeek: number, isActive: boolean, startTime: string, endTime: string) => {
    setSavingDay(dayOfWeek);
    try {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-rule",
          dayOfWeek,
          isActive,
          startTime,
          endTime,
        }),
      });
      if (res.ok) {
        setRules((prev) =>
          prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, isActive, startTime, endTime } : r))
        );
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingDay(null);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockStart) return;

    setIsBlocking(true);
    try {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "block-date",
          startDate: blockStart,
          endDate: blockEnd || blockStart,
          reason: blockReason,
        }),
      });
      if (res.ok) {
        setBlockStart("");
        setBlockEnd("");
        setBlockReason("");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsBlocking(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-block", id }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-12">
      {/* 1. Working Hours by Day */}
      <div className="bg-[#121214] border border-zinc-800 p-6 sm:p-8 rounded-sm space-y-6">
        <div>
          <h2 className="text-xl font-serif text-white font-medium">Standard Operating Hours</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Configure open days and booking window hours (Banjul GMT time). Slots will be calculated automatically.
          </p>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {DAYS.map((dayName, idx) => {
            const rule = rules.find((r) => r.dayOfWeek === idx) || {
              id: `${idx}`,
              dayOfWeek: idx,
              startTime: "09:00",
              endTime: "18:00",
              isActive: idx !== 0,
            };

            return (
              <div
                key={dayName}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="w-32 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={rule.isActive}
                    onChange={(e) =>
                      handleUpdateRule(idx, e.target.checked, rule.startTime, rule.endTime)
                    }
                    className="h-4 w-4 rounded-sm border-zinc-700 bg-zinc-900 text-editorial-gold focus:ring-editorial-gold"
                  />
                  <span className={`font-medium ${rule.isActive ? "text-white" : "text-zinc-500"}`}>
                    {dayName}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-zinc-500 text-[11px]">From:</span>
                    <input
                      type="text"
                      disabled={!rule.isActive}
                      defaultValue={rule.startTime}
                      onBlur={(e) =>
                        handleUpdateRule(idx, rule.isActive, e.target.value, rule.endTime)
                      }
                      className="bg-[#18181A] border border-zinc-700 rounded-sm px-2.5 py-1 text-white text-xs w-20 text-center font-mono disabled:opacity-40"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-zinc-500 text-[11px]">To:</span>
                    <input
                      type="text"
                      disabled={!rule.isActive}
                      defaultValue={rule.endTime}
                      onBlur={(e) =>
                        handleUpdateRule(idx, rule.isActive, rule.startTime, e.target.value)
                      }
                      className="bg-[#18181A] border border-zinc-700 rounded-sm px-2.5 py-1 text-white text-xs w-20 text-center font-mono disabled:opacity-40"
                    />
                  </div>

                  {savingDay === idx && (
                    <span className="text-editorial-gold animate-spin text-xs">⟳</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Block Dates & Holidays */}
      <div className="bg-[#121214] border border-zinc-800 p-6 sm:p-8 rounded-sm space-y-6">
        <div>
          <h2 className="text-xl font-serif text-white font-medium">Blocked Dates & Studio Holidays</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Block full dates for personal commitments, national holidays, or studio renovations.
          </p>
        </div>

        {/* Add Block Form */}
        <form onSubmit={handleAddBlock} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <Input
              label="Start Date"
              type="date"
              required
              value={blockStart}
              onChange={(e) => setBlockStart(e.target.value)}
            />
          </div>
          <div>
            <Input
              label="End Date (Optional)"
              type="date"
              value={blockEnd}
              onChange={(e) => setBlockEnd(e.target.value)}
            />
          </div>
          <div>
            <Input
              label="Reason / Note"
              placeholder="e.g. National Holiday / Travel"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isBlocking}>
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Block Date</span>
            </Button>
          </div>
        </form>

        {/* Blocked Dates List */}
        <div className="pt-4 border-t border-zinc-800">
          {initialBlocked.length === 0 ? (
            <p className="text-xs text-zinc-500">No blocked date exceptions currently configured.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {initialBlocked.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 bg-[#161618] border border-zinc-800 rounded-sm flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-medium text-white block">
                      {formatDate(b.startDate)}
                      {b.endDate && b.endDate !== b.startDate ? ` – ${formatDate(b.endDate)}` : ""}
                    </span>
                    <span className="text-[11px] text-zinc-400">{b.reason || "Studio Blocked"}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteBlock(b.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                    aria-label="Remove blocked date"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
