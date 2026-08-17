import type { Service } from "@/types";
import { createPublicClient } from "@/lib/supabase/public";

export const services: Service[] = [
  {
    id: "1",
    slug: "ms-fabrication",
    name: "MS Fabrication",
    shortDescription: "Heavy-duty mild steel fabrication for structures, frames and supports.",
    description:
      "From structural frames to load-bearing supports, we cut, weld and finish mild steel to precise tolerances for industrial and residential projects.",
    imageAlt: "Welder fabricating a mild steel frame",
    enabled: true,
  },
  {
    id: "2",
    slug: "ss-fabrication",
    name: "SS Fabrication",
    shortDescription: "Corrosion-resistant stainless steel work for kitchens, railings and facades.",
    description:
      "Stainless steel fabrication finished to a mirror or brushed grade, built for kitchens, hospitals, facades and anywhere hygiene or weather resistance matters.",
    imageAlt: "Polished stainless steel railing",
    enabled: true,
  },
  {
    id: "3",
    slug: "gates",
    name: "Gates",
    shortDescription: "Sliding, swing and automatic gates in MS and SS, made to size.",
    description:
      "Custom-measured driveway and compound gates — sliding, swing or automatic — designed to match your property and built to take daily use.",
    imageAlt: "Custom metal driveway gate",
    enabled: true,
  },
  {
    id: "4",
    slug: "doors",
    name: "Doors",
    shortDescription: "Security doors and grill doors built for durability.",
    description:
      "Steel security doors and decorative grill doors, fitted to your frame with precision so they close true for years, not months.",
    imageAlt: "Steel security door installation",
    enabled: true,
  },
  {
    id: "5",
    slug: "windows",
    name: "Windows",
    shortDescription: "Steel window frames and safety grills, cut to exact openings.",
    description:
      "Window grills and frames fabricated to your exact opening size, balancing security with airflow and light.",
    imageAlt: "Steel window grill",
    enabled: true,
  },
  {
    id: "6",
    slug: "railings",
    name: "Railings",
    shortDescription: "Staircase and balcony railings in MS, SS and combination designs.",
    description:
      "Staircase, balcony and terrace railings — from simple bar designs to detailed SS-and-glass combinations — fabricated and installed on site.",
    imageAlt: "Modern staircase railing",
    enabled: true,
  },
  {
    id: "7",
    slug: "grills",
    name: "Grills",
    shortDescription: "Window and ventilation grills, decorative or purely functional.",
    description:
      "Security and decorative grills for windows, balconies and ventilation openings, in standard or custom patterns.",
    imageAlt: "Decorative window grill pattern",
    enabled: true,
  },
  {
    id: "8",
    slug: "sheds",
    name: "Sheds",
    shortDescription: "Industrial and warehouse shed structures, trusses and roofing.",
    description:
      "Structural sheds for warehouses, factories and parking — trusses, columns and roofing sheets fabricated and erected on site.",
    imageAlt: "Industrial steel shed structure",
    enabled: true,
  },
  {
    id: "9",
    slug: "welding-work",
    name: "Welding Work",
    shortDescription: "General welding and repair work across MS and SS.",
    description:
      "On-site and workshop welding for repairs, modifications and new fabrication, across arc, MIG and TIG processes as the job needs.",
    imageAlt: "Close-up of arc welding sparks",
    enabled: true,
  },
  {
    id: "10",
    slug: "structural-fabrication",
    name: "Structural Fabrication",
    shortDescription: "Structural steel for buildings, mezzanines and platforms.",
    description:
      "Structural steel fabrication for mezzanine floors, platforms and building frames, engineered to load and delivered ready to erect.",
    imageAlt: "Structural steel beams at a construction site",
    enabled: true,
  },
  {
    id: "11",
    slug: "custom-metal-work",
    name: "Custom Metal Work",
    shortDescription: "One-off and bespoke metal fabrication to your drawing.",
    description:
      "Bring a sketch, a drawing or a rough idea — we fabricate custom metal pieces that don't fit a catalogue.",
    imageAlt: "Custom fabricated metal piece on a workbench",
    enabled: true,
  },
  {
    id: "12",
    slug: "industrial-fabrication",
    name: "Industrial Fabrication",
    shortDescription: "Fabrication for factories, plants and industrial equipment.",
    description:
      "Equipment stands, guards, platforms and fixtures fabricated to industrial specification and safety standards.",
    imageAlt: "Industrial fabrication equipment stand",
    enabled: true,
  },
  {
    id: "13",
    slug: "residential-fabrication",
    name: "Residential Fabrication",
    shortDescription: "Gates, grills and railings sized for homes.",
    description:
      "Everything a home needs in metal — gates, grills, railings and staircases — measured and fitted for residential properties.",
    imageAlt: "Residential gate and railing installation",
    enabled: true,
  },
];

export const trustPoints = [
  { title: "Quality Work", description: "Every weld and finish checked before it leaves the shop." },
  { title: "Custom Designs", description: "Built to your drawing or measured on site — not off a shelf." },
  { title: "Professional Service", description: "Clear quotes, honest timelines, no surprises." },
  { title: "On-Time Delivery", description: "We commit to a date and we hold to it." },
];

/**
 * Fetch published services from Supabase for the public site. Falls back
 * to the static `services` array above if Supabase isn't configured yet
 * (e.g. Phase 1 running without env vars) or the query fails, so the
 * public site never breaks because of a database hiccup.
 */
export async function getPublishedServices(): Promise<Service[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return services.filter((s) => s.enabled);
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("services")
      .select("id, slug, name, short_description, description, is_enabled")
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return services.filter((s) => s.enabled);
    }

    return data.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      shortDescription: row.short_description,
      description: row.description,
      imageAlt: row.name,
      enabled: row.is_enabled,
    }));
  } catch {
    return services.filter((s) => s.enabled);
  }
}

export async function getPublishedServiceBySlug(slug: string): Promise<Service | undefined> {
  const all = await getPublishedServices();
  return all.find((s) => s.slug === slug);
}
