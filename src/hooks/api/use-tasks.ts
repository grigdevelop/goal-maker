import { useQuery } from '@tanstack/react-query';
import type { GetTasksWithCurrentStateResponse, GetTaskWithCurrentStateResponse } from '@/lib/services/task-history-service';
import type { GetHistoryResponse, GetProgressHistoryResponse } from '@/lib/services/task-history-service';

export type TaskWithState = NonNullable<GetTaskWithCurrentStateResponse>;
export type TaskListItem = GetTasksWithCurrentStateResponse[number];

export function useTasks() {
    return useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await fetch('/api/tasks');
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            const data = await response.json();
            return data as GetTasksWithCurrentStateResponse;
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
            return data as TaskWithState;
        },
        enabled: !!id,
    });
}

export function useTaskHistory(taskId: number, limit?: number) {
    return useQuery({
        queryKey: ['task-history', taskId, limit],
        queryFn: async () => {
            const url = limit
                ? `/api/tasks/${taskId}/history?limit=${limit}`
                : `/api/tasks/${taskId}/history`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch task history');
            }
            const data = await response.json();
            return data as GetHistoryResponse;
        },
        enabled: !!taskId,
    });
}

export function useProgressHistory(taskId: number, limit?: number) {
    return useQuery({
        queryKey: ['progress-history', taskId, limit],
        queryFn: async () => {
            const url = limit
                ? `/api/tasks/${taskId}/progress?limit=${limit}`
                : `/api/tasks/${taskId}/progress`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch progress history');
            }
            const data = await response.json();
            return data as GetProgressHistoryResponse;
        },
        enabled: !!taskId,
    });
}
