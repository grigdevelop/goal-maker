import { z } from "zod";

export const goalSchema = z.object({
    id: z.number().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().nullable(),
});

export type GoalInput = z.infer<typeof goalSchema>;