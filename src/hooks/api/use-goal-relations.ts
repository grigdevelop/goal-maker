import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Skill, Task } from '@/../generated/prisma/client';

export function useGoalSkills(goalId: number) {
    return useQuery({
        queryKey: ['goal', goalId, 'skills'],
        queryFn: async () => {
            const res = await fetch(`/api/goals/${goalId}/skills`);
            if (!res.ok) throw new Error('Failed to fetch goal skills');
            return res.json() as Promise<Skill[]>;
        },
        enabled: !!goalId,
    });
}

export function useGoalTasks(goalId: number) {
    return useQuery({
        queryKey: ['goal', goalId, 'tasks'],
        queryFn: async () => {
            const res = await fetch(`/api/goals/${goalId}/tasks`);
            if (!res.ok) throw new Error('Failed to fetch goal tasks');
            return res.json() as Promise<Task[]>;
        },
        enabled: !!goalId,
    });
}

export function useGoalRelationMutations(goalId: number) {
    const queryClient = useQueryClient();

    const addSkill = useMutation({
        mutationFn: async (data: { skillId?: number; title?: string; description?: string | null }) => {
            const res = await fetch(`/api/goals/${goalId}/skills`, {
                method: 'POST',
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to add skill');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goal', goalId, 'skills'] });
            queryClient.invalidateQueries({ queryKey: ['skills'] });
        },
    });

    const removeSkill = useMutation({
        mutationFn: async (skillId: number) => {
            const res = await fetch(`/api/goals/${goalId}/skills/${skillId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to remove skill');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goal', goalId, 'skills'] });
        },
    });

    const addTask = useMutation({
        mutationFn: async (data: { taskId?: number; title?: string; description?: string | null }) => {
            const res = await fetch(`/api/goals/${goalId}/tasks`, {
                method: 'POST',
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to add task');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goal', goalId, 'tasks'] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    const removeTask = useMutation({
        mutationFn: async (taskId: number) => {
            const res = await fetch(`/api/goals/${goalId}/tasks/${taskId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to remove task');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goal', goalId, 'tasks'] });
        },
    });

    return { addSkill, removeSkill, addTask, removeTask };
}
