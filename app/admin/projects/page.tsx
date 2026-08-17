import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/supabase/storage";
import DeleteButton from "@/components/admin/DeleteButton";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import { deleteProject, toggleProjectPublished } from "./actions";

export const metadata: Metadata = {
  title: "Projects Management",
  robots: { index: false, follow: false },
};

export default async function AdminProjectsPage() {
  const supabase = createClient();
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, cover_image_path, is_published, updated_at, categories(name)")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Projects Management</h1>
          <p className="mt-1 text-sm text-steel-500">Your project portfolio, shown on the public Projects page.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-1.5 rounded-md bg-signal-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-signal-600"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          Could not load projects: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-steel-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-steel-100 bg-steel-50 text-xs uppercase tracking-wide text-steel-500">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-100">
            {projects?.map((project) => {
              const thumb = project.cover_image_path ? mediaUrl(project.cover_image_path) : null;
              const categoryName = project.categories?.[0]?.name ?? "";
              return (
                <tr key={project.id}>
                  <td className="px-4 py-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-steel-50">
                      {thumb ? (
                        <Image src={thumb} alt="" width={48} height={48} className="h-12 w-12 object-cover" unoptimized />
                      ) : (
                        <ImageOff className="h-5 w-5 text-steel-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-navy-900">{project.title}</td>
                  <td className="px-4 py-3 text-steel-500">{categoryName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <ToggleSwitch
                      id={project.id}
                      checked={project.is_published}
                      action={toggleProjectPublished}
                      label={`Toggle ${project.title} published`}
                    />
                  </td>
                  <td className="px-4 py-3 text-steel-500">{new Date(project.updated_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/projects/${project.id}/edit`} className="text-signal-600 hover:text-signal-500">
                        Edit
                      </Link>
                      <DeleteButton action={deleteProject} id={project.id} itemLabel={project.title} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {projects?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-steel-500">
                  No projects yet — add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
