'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { GetGoalByIdResponse } from '@/lib/services/goal-service';
import { useGoalMutations } from '@/hooks/api/use-goal-mutations';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { InlineEdit } from '@/components/ui/inline-edit';
import { useToast } from '@/components/ui/toast';

type Props = {
    goal: GetGoalByIdResponse;
}

export function GoalInfo({ goal }: Props) {
    const router = useRouter();
    const { updateMutation, deleteMutation } = useGoalMutations();
    const [showConfirm, setShowConfirm] = useState(false);
    const { success, error } = useToast();

    const handleDelete = () => {
        if (!goal) return;
        deleteMutation.mutate(String(goal.id), {
            onSuccess: () => {
                success('Goal deleted successfully');
                router.push('/goals');
            },
            onError: () => {
                error('Failed to delete goal');
                setShowConfirm(false);
            },
        });
    };

    const handleSaveTitle = useCallback(async (newTitle: string) => {
        if (!goal) return;
        return new Promise<void>((resolve, reject) => {
            updateMutation.mutate(
                { id: String(goal.id), data: { title: newTitle, description: goal.description } },
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
    }, [goal, updateMutation, success, error]);

    const handleSaveDescription = useCallback(async (newDescription: string) => {
        if (!goal) return;
        return new Promise<void>((resolve, reject) => {
            updateMutation.mutate(
                { id: String(goal.id), data: { title: goal.title, description: newDescription || null } },
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
    }, [goal, updateMutation, success, error]);

    return (
        <>
            <div className="card card-border">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <InlineEdit
                                value={goal?.title ?? ''}
                                onSave={handleSaveTitle}
                                as="h1"
                                className="card-title text-2xl"
                            />
                            <div className="mt-2">
                                <InlineEdit
                                    value={goal?.description ?? ''}
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
                title="Delete Goal"
                message={`Are you sure you want to delete "${goal?.title}"? This action cannot be undone.`}
                loading={deleteMutation.isPending}
                onConfirm={handleDelete}
                onCancel={() => setShowConfirm(false)}
            />
        </>
    )
}

export function GoalInfoLoading() {
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