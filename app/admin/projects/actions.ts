"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { projectFormSchema } from "@/lib/validations/project";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Find an existing project category by name, or create it. Keeps the
 * admin form a simple text field while still respecting the categories
 * table's foreign key relationship. */
async function resolveCategoryId(
  supabase: ReturnType<typeof createClient>,
  name: string
): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("kind", "project")
    .ilike("name", trimmed)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("categories")
    .insert({ name: trimmed, slug: slugify(trimmed), kind: "project" })
    .select("id")
    .single();

  if (error || !created) return null;
  return created.id;
}

function readProjectForm(formData: FormData) {
  const imagePaths = formData.getAll("imagePaths").map(String).filter(Boolean);
  return projectFormSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    category: formData.get("category") ?? "",
    isPublished: formData.get("isPublished") === "on",
    imagePaths,
  });
}

async function syncProjectImages(
  supabase: ReturnType<typeof createClient>,
  projectId: string,
  paths: string[]
) {
  await supabase.from("project_images").delete().eq("project_id", projectId);
  if (paths.length === 0) return;
  const rows = paths.map((storage_path, index) => ({ project_id: projectId, storage_path, sort_order: index }));
  const { error } = await supabase.from("project_images").insert(rows);
  if (error) throw new Error(`Could not save project images: ${error.message}`);
}

export async function createProject(formData: FormData) {
  const supabase = await requireAdmin();
  const values = readProjectForm(formData);
  const categoryId = await resolveCategoryId(supabase, values.category ?? "");

  const { data, error } = await supabase
    .from("projects")
    .insert({
      title: values.title,
      slug: values.slug,
      description: values.description,
      category_id: categoryId,
      cover_image_path: values.imagePaths[0] ?? null,
      is_published: values.isPublished,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Could not create project: ${error?.message ?? "unknown error"}`);
  }

  await syncProjectImages(supabase, data.id, values.imagePaths);

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  redirect("/admin/projects");
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await requireAdmin();
  const values = readProjectForm(formData);
  const categoryId = await resolveCategoryId(supabase, values.category ?? "");

  const { error } = await supabase
    .from("projects")
    .update({
      title: values.title,
      slug: values.slug,
      description: values.description,
      category_id: categoryId,
      cover_image_path: values.imagePaths[0] ?? null,
      is_published: values.isPublished,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Could not update project: ${error.message}`);
  }

  await syncProjectImages(supabase, id, values.imagePaths);

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  redirect("/admin/projects");
}

export async function deleteProject(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(`Could not delete project: ${error.message}`);
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function toggleProjectPublished(id: string, isPublished: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("projects").update({ is_published: isPublished }).eq("id", id);
  if (error) throw new Error(`Could not update project: ${error.message}`);
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}
