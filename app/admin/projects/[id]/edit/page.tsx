import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProjectForm from "@/components/admin/ProjectForm";
import { updateProject } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Project",
  robots: { index: false, follow: false },
};

interface Props {
  params: { id: string };
}

export default async function EditProjectPage({ params }: Props) {
  const supabase = createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, title, slug, description, is_published, categories(name), project_images(storage_path, sort_order)")
    .eq("id", params.id)
    .single();

  if (!project) notFound();

  const boundUpdate = updateProject.bind(null, project.id);
  const imagePaths = [...(project.project_images ?? [])]
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((img: any) => img.storage_path as string);

  return (
    <div>
      <Link href="/admin/projects" className="inline-flex items-center gap-1.5 text-sm text-steel-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-navy-900">Edit Project</h1>
      <div className="mt-6">
        <ProjectForm
          action={boundUpdate}
          defaultValues={{
            title: project.title,
            slug: project.slug,
            description: project.description,
            category: project.categories?.[0]?.name ?? "",
            isPublished: project.is_published,
            imagePaths,
          }}
        />
      </div>
    </div>
  );
}
