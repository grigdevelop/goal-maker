import { useQuery } from '@tanstack/react-query';
import type { GetTasksResponse, GetTaskByIdResponse } from '@/lib/services/task-service';

export function useTasks() {
    return useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await fetch('/api/tasks');
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            const data = await response.json();
            return data as GetTasksResponse;
        },
    });
}

export function useTask(id: number) {
    return useQuery({
        queryKey: ['task', id],
        queryFn: async () => {
            const response = await fetch(`/api/tasks/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch task');
            }
            const data = await response.json();
            return data as GetTaskByIdResponse;
        },
        enabled: !!id,
    });
}
