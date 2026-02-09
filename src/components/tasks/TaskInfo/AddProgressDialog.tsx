'use client';

import { useState } from 'react';
import type { TaskWithState } from '@/hooks/api/use-tasks';
import { useTaskMutations } from '@/hooks/api/use-task-mutations';
import { useToast } from '@/components/ui/toast';

type Props = {
    task: TaskWithState;
    dialogRef: React.RefObject<HTMLDialogElement | null>;
};

export function AddProgressDialog({ task, dialogRef }: Props) {
    const { progressMutation } = useTaskMutations();
    const { success, error } = useToast();
    const [progressIncrement, setProgressIncrement] = useState<string>('1');
    const [progressNote, setProgressNote] = useState<string>('');

    const hasProgress = task.targetCount != null && task.targetCount > 0;
    const currentCount = task.currentCount ?? 0;

    const handleAddProgress = () => {
        const inc = parseInt(progressIncrement, 10);
        if (isNaN(inc) || inc <= 0) return;
        progressMutation.mutate(
            { id: task.id, increment: inc, note: progressNote.trim() || null },
            {
                onSuccess: (result) => {
                    dialogRef.current?.close();
                    setProgressIncrement('1');
                    setProgressNote('');
                    if (result.statusChanged) {
                        success('Goal reached! Task marked as complete.');
                    } else {
                        success(`Progress updated: ${result.currentCount}/${result.targetCount}`);
                    }
                },
                onError: (err) => error(err.message),
            }
        );
    };

    return (
        <dialog ref={dialogRef} className="modal" onClick={(e) => {
            if (e.target === dialogRef.current) dialogRef.current?.close();
        }}>
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Add Progress</h3>
                <div className="space-y-3">
                    <fieldset className="fieldset">
                        <label className="label">How many did you complete?</label>
                        <input
                            type="number"
                            className="input input-sm input-bordered w-full"
                            min={1}
                            value={progressIncrement}
                            onChange={(e) => setProgressIncrement(e.target.value)}
                        />
                    </fieldset>
                    <fieldset className="fieldset">
                        <label className="label">Note (optional)</label>
                        <textarea
                            className="textarea textarea-sm textarea-bordered w-full"
                            placeholder="e.g., Watched episodes 45-50"
                            value={progressNote}
                            onChange={(e) => setProgressNote(e.target.value)}
                        />
                    </fieldset>
                    {hasProgress && (
                        <div className="text-sm opacity-70 bg-base-200 rounded-lg p-2">
                            This will update progress to{' '}
                            <span className="font-semibold">
                                {currentCount + (parseInt(progressIncrement, 10) || 0)}/{task.targetCount}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => dialogRef.current?.close()}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleAddProgress}
                            disabled={progressMutation.isPending || !progressIncrement || parseInt(progressIncrement, 10) <= 0}
                        >
                            {progressMutation.isPending && <span className="loading loading-spinner loading-xs"></span>}
                            Add Progress
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    );
}
