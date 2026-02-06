import { useQuery } from '@tanstack/react-query';
import type { GoalWithProgress } from '@/lib/services/progress-service';

export function useGoals() {
    return useQuery({
        queryKey: ['goals'],
        queryFn: async () => {
            const response = await fetch('/api/goals');
            if (!response.ok) {
                throw new Error('Failed to fetch goals');
            }
            const data = await response.json();
            return data as GoalWithProgress[];
        },
    });
}

export function useGoal(id: number) {
    return useQuery({
        queryKey: ['goal', id],
        queryFn: async () => {
            const response = await fetch(`/api/goals/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch goal');
            }
            const data = await response.json();
            return data as GoalWithProgress;
        },
        enabled: !!id,
    });
}
