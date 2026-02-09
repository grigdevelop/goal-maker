'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { TaskWithState } from '@/hooks/api/use-tasks';
import { useTaskMutations } from '@/hooks/api/use-task-mutations';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/ui/toast';
import { TaskHeader } from './TaskHeader';
import { TaskProgressCard } from './TaskProgressCard';
import { TaskControls } from './TaskControls';
import { TaskScheduleCard } from './TaskScheduleCard';
import { TaskHistoryTimeline } from './TaskHistoryTimeline';
import { AddProgressDialog } from './AddProgressDialog';

type Props = {
    task: TaskWithState;
}

export function TaskInfo({ task }: Props) {
    const router = useRouter();
    const { deleteMutation } = useTaskMutations();
    const [showConfirm, setShowConfirm] = useState(false);
    const { success, error } = useToast();
    const progressDialogRef = useRef<HTMLDialogElement>(null);

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

    return (
        <>
            <TaskHeader
                task={task}
                onDeleteRequest={() => setShowConfirm(true)}
            />

            <TaskProgressCard
                task={task}
                onAddProgress={() => progressDialogRef.current?.showModal()}
            />

            <TaskControls task={task} />

            <TaskScheduleCard task={task} />

            <TaskHistoryTimeline taskId={task.id} />

            <AddProgressDialog
                task={task}
                dialogRef={progressDialogRef}
            />

            <ConfirmDialog
                open={showConfirm}
                title="Delete Task"
                message={`Are you sure you want to delete "${task?.title}"? This action cannot be undone.`}
                loading={deleteMutation.isPending}
                onConfirm={handleDelete}
                onCancel={() => setShowConfirm(false)}
            />
        </>
    );
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
    );
}
