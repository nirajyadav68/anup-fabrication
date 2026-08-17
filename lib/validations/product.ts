import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(150),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(150)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),
  description: z.string().trim().min(20, "Description is required").max(3000),
  sku: z.string().trim().max(50).optional().or(z.literal("")),
  material: z.string().trim().max(100).optional().or(z.literal("")),
  size: z.string().trim().max(100).optional().or(z.literal("")),
  weightKg: z.coerce.number().nonnegative().optional().or(z.literal("")),
  priceType: z.enum(["fixed", "starting_from", "contact"]),
  price: z.coerce.number().nonnegative().optional().or(z.literal("")),
  stockStatus: z.enum(["in_stock", "out_of_stock", "made_to_order"]),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  imagePaths: z.array(z.string()).default([]),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
