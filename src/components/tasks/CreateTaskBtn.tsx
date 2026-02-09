'use client';

import React from 'react';
import { CreateOrUpdateTaskForm } from './CreateOrUpdateTaskForm';
import type { TaskFormData } from './CreateOrUpdateTaskForm';
import { scheduleFormDataToConfig } from './ScheduleConfigFields';
import { useTaskMutations } from '@/hooks/api/use-task-mutations';
import { useToast } from '@/components/ui/toast';
import { useDialog } from '@/components/shared/dialog';
import type { ScheduleType } from '@/lib/constants/task';

type Props = {
    className?: string;
};

export const CreateTaskBtn: React.FC<Props> = ({ className }) => {
    const { openDialog, closeDialog } = useDialog();
    const { createMutation, scheduleMutation } = useTaskMutations();
    const { success, error } = useToast();

    const handleSubmit = (data: TaskFormData) => {
        createMutation.mutate(
            {
                title: data.title,
                description: data.description || null,
                type: data.type,
                endTime: data.endTime ? new Date(data.endTime).toISOString() : null,
                targetCount: data.targetCount ? Number(data.targetCount) : null,
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
                                    closeDialog();
                                    success('Task created with schedule');
                                },
                                onError: () => {
                                    closeDialog();
                                    success('Task created, but schedule failed to save');
                                },
                            }
                        );
                    } else {
                        closeDialog();
                        success('Task created successfully');
                    }
                },
                onError: () => {
                    error('Failed to create task');
                },
            }
        );
    };

    const handleClick = () => {
        openDialog(
            <CreateOrUpdateTaskForm onClose={closeDialog} onSubmit={handleSubmit} />
        );
    };

    return (
        <button className={className} onClick={handleClick} disabled={createMutation.isPending || scheduleMutation.isPending}>
            {(createMutation.isPending || scheduleMutation.isPending) && <span className="loading loading-spinner loading-sm"></span>}
            Create Task
        </button>
    );
};