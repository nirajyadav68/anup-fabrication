import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProjectForm from "@/components/admin/ProjectForm";
import { createProject } from "../actions";

export const metadata: Metadata = {
  title: "Add Project",
  robots: { index: false, follow: false },
};

export default function NewProjectPage() {
  return (
    <div>
      <Link href="/admin/projects" className="inline-flex items-center gap-1.5 text-sm text-steel-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-navy-900">Add Project</h1>
      <div className="mt-6">
        <ProjectForm action={createProject} />
      </div>
    </div>
  );
}
