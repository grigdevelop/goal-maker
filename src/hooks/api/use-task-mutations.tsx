import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/../generated/prisma/client";
import type { TaskStatus, TaskType, ScheduleType, ScheduleConfig } from "@/lib/constants/task";

export type CreateTaskInput = {
    title: string;
    description?: string | null;
    type?: TaskType;
    endTime?: string | null;
};

export type UpdateTaskInput = {
    title: string;
    description?: string | null;
    type?: TaskType;
};

export function useTaskMutations() {
    const queryClient = useQueryClient();

    const invalidateTask = (taskId: number | string) => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["task", Number(taskId)] });
        queryClient.invalidateQueries({ queryKey: ["task-history", Number(taskId)] });
    };

    const createMutation = useMutation({
        mutationFn: async (data: CreateTaskInput) => {
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
        mutationFn: async ({ id, data }: { id: string; data: UpdateTaskInput }) => {
            const res = await fetch(`/api/tasks/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update task");
            return res.json() as Promise<Task>;
        },
        onSuccess: (updatedTask) => {
            invalidateTask(updatedTask.id);
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
            queryClient.removeQueries({ queryKey: ["task", Number(deletedId)] });
        },
    });

    const statusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number; status: TaskStatus }) => {
            const res = await fetch(`/api/tasks/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update status");
            }
            return res.json();
        },
        onSuccess: (_, { id }) => {
            invalidateTask(id);
        },
    });

    const deadlineMutation = useMutation({
        mutationFn: async ({ id, endTime }: { id: number; endTime: string | null }) => {
            const res = await fetch(`/api/tasks/${id}/deadline`, {
                method: "PATCH",
                body: JSON.stringify({ endTime }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update deadline");
            }
            return res.json();
        },
        onSuccess: (_, { id }) => {
            invalidateTask(id);
        },
    });

    const scheduleMutation = useMutation({
        mutationFn: async ({ id, scheduleType, config }: { id: number; scheduleType: ScheduleType; config: ScheduleConfig }) => {
            const res = await fetch(`/api/tasks/${id}/schedule`, {
                method: "PUT",
                body: JSON.stringify({ scheduleType, config }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update schedule");
            }
            return res.json();
        },
        onSuccess: (_, { id }) => {
            invalidateTask(id);
        },
    });

    const deleteScheduleMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/tasks/${id}/schedule`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete schedule");
            }
            return res.json();
        },
        onSuccess: (_, id) => {
            invalidateTask(id);
        },
    });

    return { createMutation, updateMutation, deleteMutation, statusMutation, deadlineMutation, scheduleMutation, deleteScheduleMutation };
}
