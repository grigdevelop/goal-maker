'use client';

import { useCallback } from 'react';
import type { TaskWithState } from '@/hooks/api/use-tasks';
import { useTaskMutations } from '@/hooks/api/use-task-mutations';
import { InlineEdit } from '@/components/ui/inline-edit';
import { useToast } from '@/components/ui/toast';
import { Trash } from 'lucide-react';
import { STATUS_BADGE, STATUS_LABEL, TYPE_LABEL } from './constants';
import type { TaskStatus as TaskStatusType } from '@/lib/constants/task';

type Props = {
    task: TaskWithState;
    onDeleteRequest: () => void;
};

export function TaskHeader({ task, onDeleteRequest }: Props) {
    const { updateMutation, deleteMutation } = useTaskMutations();
    const { success, error } = useToast();

    const currentStatus = task.currentStatus as TaskStatusType;

    const handleSaveTitle = useCallback(async (newTitle: string) => {
        if (!task) return;
        return new Promise<void>((resolve, reject) => {
            updateMutation.mutate(
                { id: String(task.id), data: { title: newTitle, description: task.description } },
                {
                    onSuccess: () => { success('Title updated'); resolve(); },
                    onError: () => { error('Failed to update title'); reject(new Error('Failed to update title')); },
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
                    onSuccess: () => { success('Description updated'); resolve(); },
                    onError: () => { error('Failed to update description'); reject(new Error('Failed to update description')); },
                }
            );
        });
    }, [task, updateMutation, success, error]);

    return (
        <div className="card card-border">
            <div className="card-body">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`badge ${STATUS_BADGE[currentStatus] ?? 'badge-ghost'}`}>
                                {STATUS_LABEL[currentStatus] ?? currentStatus}
                            </span>
                            <span className="badge badge-outline badge-sm">
                                {TYPE_LABEL[task.type] ?? task.type}
                            </span>
                        </div>
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
                        onClick={onDeleteRequest}
                        disabled={deleteMutation.isPending}
                    >
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
