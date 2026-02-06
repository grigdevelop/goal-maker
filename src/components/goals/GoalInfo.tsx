'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GetGoalByIdResponse } from '@/lib/services/goal-service';
import { useGoalMutations } from '@/hooks/api/use-goal-mutations';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

type Props = {
    goal: GetGoalByIdResponse;
}

export function GoalInfo({ goal }: Props) {
    const router = useRouter();
    const { deleteMutation } = useGoalMutations();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = () => {
        if (!goal) return;
        deleteMutation.mutate(String(goal.id), {
            onSuccess: () => {
                router.push('/goals');
            },
        });
    };

    return (
        <>
            <div className="card card-border">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="card-title text-2xl">{goal?.title}</h1>
                            <p className="text-base mt-2">{goal?.description}</p>
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