import { z } from "zod";

export const serviceFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),
  shortDescription: z.string().trim().min(10, "Short description is required").max(200),
  description: z.string().trim().min(20, "Description is required").max(2000),
  imagePath: z.string().trim().optional().or(z.literal("")),
  isEnabled: z.boolean(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
