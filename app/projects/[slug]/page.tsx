import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ImageOff } from "lucide-react";
import { getPublishedProjectBySlug, getPublishedProjects } from "@/lib/data/projects";
import { mediaUrl } from "@/lib/supabase/storage";
import WhatsAppButton from "@/components/WhatsAppButton";

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getPublishedProjectBySlug(params.slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/projects/${project.slug}` },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = await getPublishedProjectBySlug(params.slug);
  if (!project) notFound();

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm font-medium text-steel-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All projects
      </Link>

      {project.category && (
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-signal-600">{project.category}</p>
      )}
      <h1 className="mt-1 font-display text-4xl font-bold text-navy-900 sm:text-5xl">{project.title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-steel-700">{project.description}</p>

      {project.images.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {project.images.map((path) => (
            <div key={path} className="aspect-square overflow-hidden rounded-md bg-steel-50">
              <Image src={mediaUrl(path)!} alt={project.title} width={300} height={300} className="h-full w-full object-cover" unoptimized />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 flex aspect-video items-center justify-center rounded-md bg-steel-50">
          <ImageOff className="h-8 w-8 text-steel-300" />
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/quote" className="rounded-md bg-signal-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-signal-600">
          Get a Similar Job Quoted
        </Link>
        <WhatsAppButton
          message={`Hello, I saw your "${project.title}" project and I'm interested in something similar.`}
        />
      </div>
    </section>
  );
}
