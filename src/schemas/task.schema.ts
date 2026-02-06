import { z } from "zod";

export const taskSchema = z.object({
    id: z.number().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().nullable(),
});

export type TaskInput = z.infer<typeof taskSchema>;
