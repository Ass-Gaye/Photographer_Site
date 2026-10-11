"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ImageIcon, Plus, Sparkles, Trash2, Eye, MapPin } from "lucide-react";

interface CategoryData {
  id: string;
  name: string;
  slug: string;
}

interface ProjectData {
  id: string;
  title: string;
  slug: string;
  category: CategoryData;
  clientName?: string | null;
  shootDate?: Date | string | null;
  location?: string | null;
  description?: string | null;
  coverImage: string;
  isFeatured: boolean;
  isPublished: boolean;
  images: { id: string; url: string }[];
}

export function PortfolioManager({
  initialProjects,
  categories,
}: {
  initialProjects: ProjectData[];
  categories: CategoryData[];
}) {
  const [projects, setProjects] = useState<ProjectData[]>(initialProjects);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("Bakau, The Gambia");
  const [shootDate, setShootDate] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePublished = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-published", id, isPublished: !current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isPublished: !current } : p))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to toggle publish status");
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-featured", id, isFeatured: !current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isFeatured: !current } : p))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to toggle featured status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this portfolio project?")) return;

    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-project", id }),
      });
      if (!res.ok) throw new Error("Delete failed");

      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete project");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-project",
          title,
          categoryId,
          clientName,
          location,
          shootDate: shootDate || null,
          coverImage,
          description,
          isFeatured,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create project");

      setProjects((prev) => [data.project, ...prev]);
      setShowCreateModal(false);
      setTitle("");
      setCoverImage("");
      setDescription("");
      setClientName("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating project";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-end">
        <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          <span>Add Portfolio Project</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[#121214] border border-zinc-800 rounded-sm text-zinc-500 text-xs">
            No projects found. Create your first portfolio story.
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="bg-[#121214] border border-zinc-800 rounded-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[4/3] bg-zinc-900 border-b border-zinc-800">
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                    <span className="bg-black/70 backdrop-blur-md text-white text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium border border-white/10">
                      {project.category.name}
                    </span>
                    {project.isFeatured && (
                      <span className="bg-editorial-gold text-black text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-serif text-lg text-white font-medium truncate">
                    {project.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>{project.location || "The Gambia"}</span>
                    <span>{formatDate(project.shootDate)}</span>
                  </div>
                  {project.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => togglePublished(project.id, project.isPublished)}
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-medium ${
                      project.isPublished
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {project.isPublished ? "Live" : "Draft"}
                  </button>
                  <button
                    onClick={() => toggleFeatured(project.id, project.isFeatured)}
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-medium ${
                      project.isFeatured
                        ? "bg-amber-950/80 text-amber-300 border border-amber-800"
                        : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                    }`}
                  >
                    {project.isFeatured ? "Featured ★" : "Make Featured"}
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    href={`/portfolio/${project.slug}`}
                    target="_blank"
                    className="p-1.5 text-zinc-400 hover:text-white"
                    title="View on site"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 text-red-400 hover:text-red-300"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-zinc-700 p-6 sm:p-8 rounded-sm max-w-lg w-full space-y-6">
            <h3 className="font-serif text-xl text-white">Create Portfolio Project</h3>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <Input
                label="Project Title"
                placeholder="e.g. Mariama & Ebrima — Serrekunda Matrimony"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[#18181A] border border-zinc-700 rounded-sm px-3 py-2 text-white text-xs focus:outline-none focus:border-editorial-gold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Shoot Date (Optional)"
                  type="date"
                  value={shootDate}
                  onChange={(e) => setShootDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Location"
                  placeholder="e.g. Fajara Beach, Banjul"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Input
                  label="Client Name (Optional)"
                  placeholder="e.g. Mariama & Ebrima"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <Input
                label="High-Res Cover Image URL"
                placeholder="/instagram/post-1.jpg or https://..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                required
              />

              <Textarea
                label="Project Editorial Narrative"
                placeholder="Describe the aesthetic, light, mood, and story behind this shoot..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featProjCheck"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-editorial-gold focus:ring-0"
                />
                <label htmlFor="featProjCheck" className="text-xs text-zinc-300">
                  Feature on website homepage
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                >
                  Save Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
