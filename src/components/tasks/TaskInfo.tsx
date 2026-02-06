'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { GetTaskByIdResponse } from '@/lib/services/task-service';
import { useTaskMutations } from '@/hooks/api/use-task-mutations';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { InlineEdit } from '@/components/ui/inline-edit';
import { useToast } from '@/components/ui/toast';

type Props = {
    task: GetTaskByIdResponse;
}

export function TaskInfo({ task }: Props) {
    const router = useRouter();
    const { updateMutation, deleteMutation } = useTaskMutations();
    const [showConfirm, setShowConfirm] = useState(false);
    const { success, error } = useToast();

    const handleDelete = () => {
        if (!task) return;
        deleteMutation.mutate(String(task.id), {
            onSuccess: () => {
                success('Task deleted successfully');
                router.push('/tasks');
            },
            onError: () => {
                error('Failed to delete task');
                setShowConfirm(false);
            },
        });
    };

    const handleSaveTitle = useCallback(async (newTitle: string) => {
        if (!task) return;
        return new Promise<void>((resolve, reject) => {
            updateMutation.mutate(
                { id: String(task.id), data: { title: newTitle, description: task.description } },
                {
                    onSuccess: () => {
                        success('Title updated');
                        resolve();
                    },
                    onError: () => {
                        error('Failed to update title');
                        reject(new Error('Failed to update title'));
                    },
                }
            );
        });
    }, [task, updateMutation, success, error]);

    const handleSaveDescription = useCallback(async (newDescription: string) => {
        if (!task) return;
        return new Promise<void>((resolve, reject) => {
            updateMutation.mutate(
                { id: String(task.id), data: { title: task.title, description: newDescription || null } },
                {
                    onSuccess: () => {
                        success('Description updated');
                        resolve();
                    },
                    onError: () => {
                        error('Failed to update description');
                        reject(new Error('Failed to update description'));
                    },
                }
            );
        });
    }, [task, updateMutation, success, error]);

    return (
        <>
            <div className="card card-border">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <InlineEdit
                                value={task?.title ?? ''}
                                onSave={handleSaveTitle}
                                as="h1"
                                className="card-title text-2xl"
                            />
                            <div className="mt-2">
                                <InlineEdit
                                    value={task?.description ?? ''}
                                    onSave={handleSaveDescription}
                                    as="p"
                                    className="text-base"
                                    multiline
                                    required={false}
                                    placeholder="Add a description..."
                                />
                            </div>
                        </div>
                        <button
                            className="btn btn-error btn-sm"
                            onClick={() => setShowConfirm(true)}
                            disabled={deleteMutation.isPending}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
            <ConfirmDialog
                open={showConfirm}
                title="Delete Task"
                message={`Are you sure you want to delete "${task?.title}"? This action cannot be undone.`}
                loading={deleteMutation.isPending}
                onConfirm={handleDelete}
                onCancel={() => setShowConfirm(false)}
            />
        </>
    )
}

export function TaskInfoLoading() {
    return (
        <div className="card card-border">
            <div className="card-body">
                <div className="skeleton h-8 w-3/4 mb-4"></div>
                <div className="skeleton h-4 w-full mb-2"></div>
                <div className="skeleton h-4 w-full mb-2"></div>
                <div className="skeleton h-4 w-2/3"></div>
            </div>
        </div>
    )
}
