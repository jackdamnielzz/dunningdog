import { z } from "zod";
import { db } from "@/lib/db";

export const brandingSchema = z.object({
  companyName: z.string().max(100).optional(),
  logoUrl: z
    .string()
    .url()
    .max(500)
    .optional()
    .or(z.literal("")),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color")
    .optional(),
  footerText: z.string().max(500).optional(),
});

export type BrandingInput = z.infer<typeof brandingSchema>;

export async function getBranding(workspaceId: string) {
  return db.emailBranding.findUnique({
    where: { workspaceId },
  });
}

export async function upsertBranding(workspaceId: string, input: BrandingInput) {
  return db.emailBranding.upsert({
    where: { workspaceId },
    update: {
      companyName: input.companyName,
      logoUrl: input.logoUrl || null,
      accentColor: input.accentColor,
      footerText: input.footerText,
    },
    create: {
      workspaceId,
      companyName: input.companyName,
      logoUrl: input.logoUrl || null,
      accentColor: input.accentColor ?? "#10b981",
      footerText: input.footerText,
    },
  });
}
