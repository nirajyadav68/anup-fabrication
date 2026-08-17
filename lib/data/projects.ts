import { createPublicClient } from "@/lib/supabase/public";

export interface PublicProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string | null;
  images: string[]; // storage paths, sorted, cover first
}

export async function getPublishedProjects(): Promise<PublicProject[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, slug, description, categories(name), project_images(storage_path, sort_order)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    category: row.categories?.name ?? null,
    images: [...(row.project_images ?? [])]
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((img: any) => img.storage_path as string),
  }));
}

export async function getPublishedProjectBySlug(slug: string): Promise<PublicProject | undefined> {
  const projects = await getPublishedProjects();
  return projects.find((p) => p.slug === slug);
}

export function getProjectCategories(projects: PublicProject[]): string[] {
  const set = new Set(projects.map((p) => p.category).filter(Boolean) as string[]);
  return Array.from(set).sort();
}
