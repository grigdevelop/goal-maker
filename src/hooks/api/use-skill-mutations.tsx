import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SkillInput } from "@/schemas/skill.schema";
import { Skill } from "@/../generated/prisma/client";

export function useSkillMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (data: SkillInput) => {
            const res = await fetch("/api/skills", {
                method: "POST",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create skill");
            return res.json() as Promise<Skill>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["skills"] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: SkillInput }) => {
            const res = await fetch(`/api/skills/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update skill");
            return res.json() as Promise<Skill>;
        },
        onSuccess: (updatedSkill) => {
            queryClient.invalidateQueries({ queryKey: ["skills"] });
            queryClient.setQueryData(["skill", updatedSkill.id], updatedSkill);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/skills/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete skill");
            return res.json();
        },
        onSuccess: (_, deletedId) => {
            queryClient.invalidateQueries({ queryKey: ["skills"] });
            queryClient.removeQueries({ queryKey: ["skill", deletedId] });
        },
    });

    return { createMutation, updateMutation, deleteMutation };
}
