import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task, Goal } from '@/../generated/prisma/client';

export function useSkillTasks(skillId: number) {
    return useQuery({
        queryKey: ['skill', skillId, 'tasks'],
        queryFn: async () => {
            const res = await fetch(`/api/skills/${skillId}/tasks`);
            if (!res.ok) throw new Error('Failed to fetch skill tasks');
            return res.json() as Promise<Task[]>;
        },
        enabled: !!skillId,
    });
}

export function useSkillGoals(skillId: number) {
    return useQuery({
        queryKey: ['skill', skillId, 'goals'],
        queryFn: async () => {
            const res = await fetch(`/api/skills/${skillId}/goals`);
            if (!res.ok) throw new Error('Failed to fetch skill goals');
            return res.json() as Promise<Goal[]>;
        },
        enabled: !!skillId,
    });
}

export function useSkillRelationMutations(skillId: number) {
    const queryClient = useQueryClient();

    const addTask = useMutation({
        mutationFn: async (data: { taskId?: number; title?: string; description?: string | null }) => {
            const res = await fetch(`/api/skills/${skillId}/tasks`, {
                method: 'POST',
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to add task');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['skill', skillId, 'tasks'] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    const removeTask = useMutation({
        mutationFn: async (taskId: number) => {
            const res = await fetch(`/api/skills/${skillId}/tasks/${taskId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to remove task');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['skill', skillId, 'tasks'] });
        },
    });

    return { addTask, removeTask };
}
