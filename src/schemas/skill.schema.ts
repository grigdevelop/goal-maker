import { z } from "zod";

export const skillSchema = z.object({
    id: z.number().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().nullable(),
});

export type SkillInput = z.infer<typeof skillSchema>;