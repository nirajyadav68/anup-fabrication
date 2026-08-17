import { z } from "zod";

export const quoteFormSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Please enter a valid phone number"),
  whatsapp: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Please enter a valid WhatsApp number")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Please enter a valid email address").optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  serviceType: z.string().trim().max(100).optional().or(z.literal("")),
  productOrProject: z.string().trim().max(200).optional().or(z.literal("")),
  material: z.string().trim().max(100).optional().or(z.literal("")),
  approximateSize: z.string().trim().max(100).optional().or(z.literal("")),
  quantity: z.coerce.number().int().positive().optional().or(z.literal("")),
  budget: z.coerce.number().nonnegative().optional().or(z.literal("")),
  requiredDate: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().min(10, "Please describe what you need").max(2000),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
