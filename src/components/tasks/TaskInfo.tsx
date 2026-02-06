'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GetTaskByIdResponse } from '@/lib/services/task-service';
import { useTaskMutations } from '@/hooks/api/use-task-mutations';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

type Props = {
    task: GetTaskByIdResponse;
}

export function TaskInfo({ task }: Props) {
    const router = useRouter();
    const { deleteMutation } = useTaskMutations();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = () => {
        if (!task) return;
        deleteMutation.mutate(String(task.id), {
            onSuccess: () => {
                router.push('/tasks');
            },
        });
    };

    return (
        <>
            <div className="card card-border">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="card-title text-2xl">{task?.title}</h1>
                            <p className="text-base mt-2">{task?.description}</p>
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
