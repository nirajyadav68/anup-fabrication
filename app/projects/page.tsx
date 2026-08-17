import type { Metadata } from "next";
import ProjectGallery from "@/components/ProjectGallery";
import { getPublishedProjects, getProjectCategories } from "@/lib/data/projects";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects",
  description: `Browse completed fabrication projects from ${siteConfig.name} — gates, railings, sheds and more.`,
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();
  const categories = getProjectCategories(projects);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal-600">Portfolio</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-navy-900 sm:text-5xl">Our Projects</h1>
      <p className="mt-3 max-w-2xl text-steel-500">
        A selection of completed work — filter by category or search by name.
      </p>

      {projects.length === 0 ? (
        <p className="mt-10 text-steel-500">No projects published yet — check back soon.</p>
      ) : (
        <div className="mt-8">
          <ProjectGallery projects={projects} categories={categories} />
        </div>
      )}
    </section>
  );
}
