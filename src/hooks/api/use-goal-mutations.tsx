import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GoalInput } from "@/schemas/goal.schema";
import { Goal } from "@/../generated/prisma/client";

export function useGoalMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (data: GoalInput) => {
            const res = await fetch("/api/goals", {
                method: "POST",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create goal");
            return res.json() as Promise<Goal>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: GoalInput }) => {
            const res = await fetch(`/api/goals/${id}`, {
                method: "PATCH",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update goal");
            return res.json() as Promise<Goal>;
        },
        onSuccess: (updatedGoal) => {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
            queryClient.setQueryData(["goal", updatedGoal.id], updatedGoal);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/goals/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete goal");
            return res.json();
        },
        onSuccess: (_, deletedId) => {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
            queryClient.removeQueries({ queryKey: ["goal", deletedId] });
        },
    });

    return { createMutation, updateMutation, deleteMutation };
}
