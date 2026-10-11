"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Layers, Plus, Check, Edit, Sparkles, Clock } from "lucide-react";

interface PackageData {
  id: string;
  name: string;
  price: number | string | { toString(): string };
  depositAmount: number | string | { toString(): string };
  durationMinutes: number;
  editedPhotosCount: number;
  deliverables: string;
  isActive: boolean;
  isFeatured: boolean;
}

interface ServiceData {
  id: string;
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  bufferMinutes: number;
  startingPrice: number | string | { toString(): string };
  isActive: boolean;
  coverImage?: string | null;
  packages: PackageData[];
}

export function ServicesManager({ initialServices }: { initialServices: ServiceData[] }) {
  const [services, setServices] = useState<ServiceData[]>(initialServices);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
  const [newPackageServiceId, setNewPackageServiceId] = useState<string | null>(null);

  // New package fields
  const [newPkgName, setNewPkgName] = useState("");
  const [newPkgPrice, setNewPkgPrice] = useState("");
  const [newPkgDeposit, setNewPkgDeposit] = useState("");
  const [newPkgDuration, setNewPkgDuration] = useState("60");
  const [newPkgPhotos, setNewPkgPhotos] = useState("15");
  const [newPkgDeliverables, setNewPkgDeliverables] = useState("");
  const [newPkgFeatured, setNewPkgFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleServiceActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-service-active", id, isActive: !current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !current } : s))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to toggle service status");
    }
  };

  const togglePackageActive = async (serviceId: string, pkgId: string, current: boolean) => {
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-package-active", id: pkgId, isActive: !current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId
            ? {
                ...s,
                packages: s.packages.map((p) =>
                  p.id === pkgId ? { ...p, isActive: !current } : p
                ),
              }
            : s
        )
      );
    } catch (e) {
      console.error(e);
      alert("Failed to toggle package status");
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackageServiceId) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-package",
          serviceId: newPackageServiceId,
          name: newPkgName,
          price: newPkgPrice,
          depositAmount: newPkgDeposit || "0",
          durationMinutes: newPkgDuration,
          editedPhotosCount: newPkgPhotos,
          deliverables: newPkgDeliverables,
          isFeatured: newPkgFeatured,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create package");

      setServices((prev) =>
        prev.map((s) =>
          s.id === newPackageServiceId
            ? { ...s, packages: [...s.packages, data.package] }
            : s
        )
      );

      setNewPackageServiceId(null);
      setNewPkgName("");
      setNewPkgPrice("");
      setNewPkgDeposit("");
      setNewPkgDeliverables("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating package";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {services.map((service) => (
        <div key={service.id} className="bg-[#121214] border border-zinc-800 rounded-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-serif text-white font-medium">{service.name}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold ${
                    service.isActive
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                      : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                  }`}
                >
                  {service.isActive ? "Active" : "Archived"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl">{service.description}</p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant={service.isActive ? "outline" : "primary"}
                size="sm"
                onClick={() => toggleServiceActive(service.id, service.isActive)}
              >
                <span>{service.isActive ? "Deactivate Service" : "Activate Service"}</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setNewPackageServiceId(service.id)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Add Package</span>
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-6 text-xs text-zinc-400">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Starting Price</span>
              <strong className="text-white">{formatCurrency(service.startingPrice)}</strong>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Standard Duration</span>
              <strong className="text-white">{service.durationMinutes} mins</strong>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Buffer Time</span>
              <strong className="text-white">{service.bufferMinutes} mins</strong>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Packages</span>
              <strong className="text-white">{service.packages.length}</strong>
            </div>
          </div>

          {/* Packages Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161618] border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Package Name</th>
                  <th className="py-2.5 px-3 font-medium">Fee (GMD)</th>
                  <th className="py-2.5 px-3 font-medium">Deposit</th>
                  <th className="py-2.5 px-3 font-medium">Duration</th>
                  <th className="py-2.5 px-3 font-medium">Photos</th>
                  <th className="py-2.5 px-3 font-medium">Deliverables</th>
                  <th className="py-2.5 px-3 font-medium">Featured</th>
                  <th className="py-2.5 px-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {service.packages.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-zinc-500">
                      No packages created under this service yet.
                    </td>
                  </tr>
                ) : (
                  service.packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-zinc-900/40">
                      <td className="py-3 px-3 text-white font-medium">{pkg.name}</td>
                      <td className="py-3 px-3 font-serif text-editorial-gold font-medium">
                        {formatCurrency(pkg.price)}
                      </td>
                      <td className="py-3 px-3 text-zinc-300">
                        {Number(pkg.depositAmount) > 0 ? formatCurrency(pkg.depositAmount) : "Standard %"}
                      </td>
                      <td className="py-3 px-3 text-zinc-400">{pkg.durationMinutes}m</td>
                      <td className="py-3 px-3 text-zinc-400">{pkg.editedPhotosCount} edits</td>
                      <td className="py-3 px-3 text-zinc-400 max-w-xs truncate">{pkg.deliverables}</td>
                      <td className="py-3 px-3">
                        {pkg.isFeatured ? (
                          <span className="text-editorial-gold font-medium text-[10px]">Yes</span>
                        ) : (
                          <span className="text-zinc-600 text-[10px]">No</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => togglePackageActive(service.id, pkg.id, pkg.isActive)}
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-medium transition-colors ${
                            pkg.isActive
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}
                        >
                          {pkg.isActive ? "Active" : "Archived"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Create Package Modal / Form */}
      {newPackageServiceId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-zinc-700 p-6 sm:p-8 rounded-sm max-w-lg w-full space-y-6">
            <h3 className="font-serif text-xl text-white">Create New Package</h3>

            <form onSubmit={handleCreatePackage} className="space-y-4">
              <Input
                label="Package Name"
                placeholder="e.g. Master Bridal Collection"
                value={newPkgName}
                onChange={(e) => setNewPkgName(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price (GMD)"
                  type="number"
                  placeholder="e.g. 15000"
                  value={newPkgPrice}
                  onChange={(e) => setNewPkgPrice(e.target.value)}
                  required
                />
                <Input
                  label="Fixed Deposit (GMD, Optional)"
                  type="number"
                  placeholder="0 for default %"
                  value={newPkgDeposit}
                  onChange={(e) => setNewPkgDeposit(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Duration (Minutes)"
                  type="number"
                  value={newPkgDuration}
                  onChange={(e) => setNewPkgDuration(e.target.value)}
                  required
                />
                <Input
                  label="Edited Photos Count"
                  type="number"
                  value={newPkgPhotos}
                  onChange={(e) => setNewPkgPhotos(e.target.value)}
                  required
                />
              </div>

              <Textarea
                label="Deliverables Description"
                placeholder="e.g. 20 retouched photos, online gallery, 2 outfit changes..."
                value={newPkgDeliverables}
                onChange={(e) => setNewPkgDeliverables(e.target.value)}
                required
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={newPkgFeatured}
                  onChange={(e) => setNewPkgFeatured(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-editorial-gold focus:ring-0"
                />
                <label htmlFor="featuredCheck" className="text-xs text-zinc-300">
                  Highlight as &quot;Recommended&quot; on pricing tables
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setNewPackageServiceId(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                >
                  Create Package
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
