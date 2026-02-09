'use client';

import { useState } from 'react';
import type { TaskWithState } from '@/hooks/api/use-tasks';
import { useTaskMutations } from '@/hooks/api/use-task-mutations';
import { useToast } from '@/components/ui/toast';
import { TaskType, ScheduleType } from '@/lib/constants/task';
import type { ScheduleType as ScheduleTypeType } from '@/lib/constants/task';
import {
    ScheduleConfigFields,
    parseScheduleToFormData,
    getDefaultScheduleFormData,
    scheduleFormDataToConfig,
    validateScheduleFormData,
} from '../ScheduleConfigFields';
import type { ScheduleFormData } from '../ScheduleConfigFields';

type Props = {
    task: TaskWithState;
};

export function TaskScheduleCard({ task }: Props) {
    const { scheduleMutation, deleteScheduleMutation } = useTaskMutations();
    const { success, error } = useToast();

    const [scheduleData, setScheduleData] = useState<ScheduleFormData>(() =>
        task.schedule
            ? parseScheduleToFormData(task.schedule.scheduleType, task.schedule.config)
            : getDefaultScheduleFormData(task.type === TaskType.CUSTOM ? ScheduleType.CUSTOM : undefined)
    );
    const [scheduleError, setScheduleError] = useState<string | null>(null);

    const showSchedule = task.type === TaskType.REPEATABLE || task.type === TaskType.CUSTOM;
    if (!showSchedule) return null;

    const handleSaveSchedule = () => {
        const dataToValidate = task.type === TaskType.CUSTOM
            ? { ...scheduleData, scheduleType: ScheduleType.CUSTOM as ScheduleTypeType }
            : scheduleData;
        const validationError = validateScheduleFormData(dataToValidate);
        if (validationError) {
            setScheduleError(validationError);
            return;
        }
        setScheduleError(null);
        const config = scheduleFormDataToConfig(dataToValidate);
        scheduleMutation.mutate(
            { id: task.id, scheduleType: dataToValidate.scheduleType as ScheduleTypeType, config },
            {
                onSuccess: () => success('Schedule saved'),
                onError: (err) => error(err.message),
            }
        );
    };

    const handleDeleteSchedule = () => {
        deleteScheduleMutation.mutate(task.id, {
            onSuccess: () => {
                success('Schedule removed');
                setScheduleData(getDefaultScheduleFormData(task.type === TaskType.CUSTOM ? ScheduleType.CUSTOM : undefined));
            },
            onError: (err) => error(err.message),
        });
    };

    return (
        <div className="card card-border mt-4">
            <div className="card-body p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">
                        {task.type === TaskType.CUSTOM ? 'Custom Dates' : 'Schedule Configuration'}
                    </h3>
                    <div className="flex gap-2">
                        {task.schedule && (
                            <button
                                className="btn btn-ghost btn-xs text-error"
                                onClick={handleDeleteSchedule}
                                disabled={deleteScheduleMutation.isPending}
                            >
                                Remove
                            </button>
                        )}
                        <button
                            className="btn btn-primary btn-xs"
                            onClick={handleSaveSchedule}
                            disabled={scheduleMutation.isPending}
                        >
                            {scheduleMutation.isPending && <span className="loading loading-spinner loading-xs"></span>}
                            Save Schedule
                        </button>
                    </div>
                </div>
                <ScheduleConfigFields
                    value={task.type === TaskType.CUSTOM
                        ? { ...scheduleData, scheduleType: ScheduleType.CUSTOM }
                        : scheduleData
                    }
                    onChange={(data) => { setScheduleData(data); setScheduleError(null); }}
                    showScheduleTypeSelector={task.type === TaskType.REPEATABLE}
                    error={scheduleError}
                />
            </div>
        </div>
    );
}
