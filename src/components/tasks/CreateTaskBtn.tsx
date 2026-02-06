'use client';

import React, { useRef, useState } from 'react';
import { CreateOrUpdateTaskForm } from './CreateOrUpdateTaskForm';
import type { TaskFormData } from './CreateOrUpdateTaskForm';
import { scheduleFormDataToConfig } from './ScheduleConfigFields';
import { useTaskMutations } from '@/hooks/api/use-task-mutations';
import { useToast } from '@/components/ui/toast';
import type { ScheduleType } from '@/lib/constants/task';

export const CreateTaskBtn: React.FC = () => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const { createMutation, scheduleMutation } = useTaskMutations();
    const { success, error } = useToast();

    const handleClick = () => {
        setIsOpen(true);
        dialogRef.current?.showModal();
    };

    const handleClose = () => {
        dialogRef.current?.close();
        setIsOpen(false);
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        const dialog = dialogRef.current;
        if (dialog && e.target === dialog) {
            handleClose();
        }
    };

    const handleSubmit = (data: TaskFormData) => {
        createMutation.mutate(
            {
                title: data.title,
                description: data.description || null,
                type: data.type,
                endTime: data.endTime ? new Date(data.endTime).toISOString() : null,
            },
            {
                onSuccess: (createdTask) => {
                    if (data.schedule) {
                        const config = scheduleFormDataToConfig(data.schedule);
                        scheduleMutation.mutate(
                            {
                                id: createdTask.id,
                                scheduleType: data.schedule.scheduleType as ScheduleType,
                                config,
                            },
                            {
                                onSuccess: () => {
                                    handleClose();
                                    success('Task created with schedule');
                                },
                                onError: () => {
                                    handleClose();
                                    success('Task created, but schedule failed to save');
                                },
                            }
                        );
                    } else {
                        handleClose();
                        success('Task created successfully');
                    }
                },
                onError: () => {
                    error('Failed to create task');
                },
            }
        );
    };

    return (
        <>
            <button onClick={handleClick} className="btn btn-sm" disabled={createMutation.isPending || scheduleMutation.isPending}>
                {(createMutation.isPending || scheduleMutation.isPending) && <span className="loading loading-spinner loading-sm"></span>}
                Create Task
            </button>
            <dialog ref={dialogRef} className="modal" onClick={handleBackdropClick}>
                <div className="modal-box">
                    {isOpen && (
                        <CreateOrUpdateTaskForm onClose={handleClose} onSubmit={handleSubmit} />
                    )}
                </div>
            </dialog>
        </>
    );
};
