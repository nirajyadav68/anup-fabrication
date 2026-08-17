"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ImageOff, X } from "lucide-react";
import { mediaUrl } from "@/lib/supabase/storage";
import type { PublicProject } from "@/lib/data/projects";
import { cn } from "@/lib/utils";

interface ProjectGalleryProps {
  projects: PublicProject[];
  categories: string[];
}

export default function ProjectGallery({ projects, categories }: ProjectGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesCategory = !activeCategory || p.category === activeCategory;
      const matchesSearch =
        !search.trim() || p.title.toLowerCase().includes(search.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [projects, activeCategory, search]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              activeCategory === null
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-steel-300 text-steel-600 hover:border-navy-900"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                activeCategory === cat
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-steel-300 text-steel-600 hover:border-navy-900"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            aria-label="Search projects"
            className="w-full rounded-md border border-steel-300 py-2 pl-9 pr-3 text-sm focus:border-signal-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-steel-500">No projects match that filter yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => {
            const thumb = project.images[0] ? mediaUrl(project.images[0]) : null;
            return (
              <div key={project.id} className="overflow-hidden rounded-lg border border-steel-100 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => thumb && setLightboxSrc(thumb)}
                  className="flex aspect-[4/3] w-full items-center justify-center bg-steel-50"
                  aria-label={`View larger image of ${project.title}`}
                >
                  {thumb ? (
                    <Image src={thumb} alt={project.title} width={400} height={300} className="h-full w-full object-cover" unoptimized />
                  ) : (
                    <ImageOff className="h-8 w-8 text-steel-300" />
                  )}
                </button>
                <div className="p-4">
                  {project.category && (
                    <p className="text-xs font-medium uppercase tracking-wide text-signal-600">{project.category}</p>
                  )}
                  <h3 className="mt-1 font-display text-base font-semibold text-navy-900">{project.title}</h3>
                  <Link href={`/projects/${project.slug}`} className="mt-2 inline-block text-sm font-semibold text-signal-600 hover:text-signal-500">
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightboxSrc(null)}
            className="absolute right-5 top-5 text-white"
          >
            <X className="h-7 w-7" />
          </button>
          <Image
            src={lightboxSrc}
            alt=""
            width={1000}
            height={1000}
            className="max-h-[85vh] w-auto rounded-md object-contain"
            unoptimized
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
