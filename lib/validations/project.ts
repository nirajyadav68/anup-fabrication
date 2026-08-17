import { z } from "zod";

export const projectFormSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(150),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(150)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),
  description: z.string().trim().min(20, "Description is required").max(3000),
  category: z.string().trim().max(100).optional().or(z.literal("")),
  isPublished: z.boolean(),
  imagePaths: z.array(z.string()).default([]),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
