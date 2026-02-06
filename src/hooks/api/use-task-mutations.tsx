import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskInput } from "@/schemas/task.schema";
import { Task } from "@/../generated/prisma/client";

export function useTaskMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (data: TaskInput) => {
            const res = await fetch("/api/tasks", {
                method: "POST",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create task");
            return res.json() as Promise<Task>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: TaskInput }) => {
            const res = await fetch(`/api/tasks/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update task");
            return res.json() as Promise<Task>;
        },
        onSuccess: (updatedTask) => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.setQueryData(["task", updatedTask.id], updatedTask);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/tasks/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete task");
            return res.json();
        },
        onSuccess: (_, deletedId) => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.removeQueries({ queryKey: ["task", deletedId] });
        },
    });

    return { createMutation, updateMutation, deleteMutation };
}
