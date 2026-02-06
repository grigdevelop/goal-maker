'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { TaskType, ScheduleType } from "@/lib/constants/task";
import type { TaskType as TaskTypeType } from "@/lib/constants/task";
import {
    ScheduleConfigFields,
    getDefaultScheduleFormData,
    validateScheduleFormData,
} from './ScheduleConfigFields';
import type { ScheduleFormData } from './ScheduleConfigFields';

const TYPE_LABEL: Record<string, string> = {
    [TaskType.REGULAR]: 'Regular',
    [TaskType.REPEATABLE]: 'Repeatable',
    [TaskType.CUSTOM]: 'Custom',
};

export type TaskFormValues = {
    title: string;
    description: string;
    type: TaskTypeType;
    endTime: string;
};

export type TaskFormData = TaskFormValues & {
    schedule?: ScheduleFormData;
};

type Props = {
    task?: Partial<TaskFormValues> & { id?: number; schedule?: ScheduleFormData };
    onSubmit: (data: TaskFormData) => void;
    onClose: () => void;
};

export function CreateOrUpdateTaskForm({ task, onSubmit, onClose }: Props) {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<TaskFormValues>({
        defaultValues: {
            title: task?.title || '',
            description: task?.description || '',
            type: task?.type || TaskType.REGULAR,
            endTime: task?.endTime || '',
        }
    });

    const [scheduleData, setScheduleData] = useState<ScheduleFormData>(
        task?.schedule ?? getDefaultScheduleFormData()
    );
    const [scheduleError, setScheduleError] = useState<string | null>(null);

    const selectedType = watch('type');
    const showDeadline = selectedType !== TaskType.CUSTOM;
    const showSchedule = selectedType === TaskType.REPEATABLE || selectedType === TaskType.CUSTOM;

    const onFormSubmit = (formValues: TaskFormValues) => {
        if (showSchedule) {
            const scheduleToValidate = selectedType === TaskType.CUSTOM
                ? { ...scheduleData, scheduleType: ScheduleType.CUSTOM }
                : scheduleData;
            const validationError = validateScheduleFormData(scheduleToValidate);
            if (validationError) {
                setScheduleError(validationError);
                return;
            }
            setScheduleError(null);
            onSubmit({
                ...formValues,
                schedule: scheduleToValidate,
            });
        } else {
            onSubmit(formValues);
        }
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="fieldset">
            <legend className="fieldset-legend text-lg font-semibold pt-0">{task?.id ? 'Update Task' : 'Create Task'}</legend>

            <fieldset className="fieldset">
                <label className="label">Title</label>
                <input
                    type="text"
                    className="input input-sm w-full"
                    placeholder="Task title"
                    {...register('title', {
                        required: 'Title is required'
                    })}
                />
                {errors.title && <span className="text-error text-sm">{errors.title.message}</span>}
            </fieldset>

            <label className="fieldset">
                <span className="label">Description</span>
                <textarea
                    className="textarea textarea-sm w-full"
                    placeholder="Task description"
                    {...register('description')}
                />
            </label>

            <fieldset className="fieldset">
                <label className="label">Type</label>
                <select
                    className="select select-sm w-full"
                    {...register('type')}
                >
                    {Object.entries(TaskType).map(([key, value]) => (
                        <option key={key} value={value}>
                            {TYPE_LABEL[value]}
                        </option>
                    ))}
                </select>
                <span className="text-xs opacity-50 mt-1">
                    {selectedType === TaskType.REGULAR && 'Simple task with optional deadline'}
                    {selectedType === TaskType.REPEATABLE && 'Repeats on a schedule (daily, weekly, monthly)'}
                    {selectedType === TaskType.CUSTOM && 'Active on specific dates from calendar'}
                </span>
            </fieldset>

            {showDeadline && (
                <fieldset className="fieldset">
                    <label className="label">Deadline</label>
                    <input
                        type="date"
                        className="input input-sm w-full"
                        {...register('endTime')}
                    />
                </fieldset>
            )}

            {/* Schedule config — REPEATABLE: full selector, CUSTOM: dates only */}
            {selectedType === TaskType.REPEATABLE && (
                <div className="mt-2 p-3 rounded-lg bg-base-200">
                    <h4 className="font-semibold text-sm mb-2">Schedule Configuration</h4>
                    <ScheduleConfigFields
                        value={scheduleData}
                        onChange={(data) => { setScheduleData(data); setScheduleError(null); }}
                        showScheduleTypeSelector={true}
                        error={scheduleError}
                    />
                </div>
            )}

            {selectedType === TaskType.CUSTOM && (
                <div className="mt-2 p-3 rounded-lg bg-base-200">
                    <h4 className="font-semibold text-sm mb-2">Custom Dates</h4>
                    <ScheduleConfigFields
                        value={{ ...scheduleData, scheduleType: ScheduleType.CUSTOM }}
                        onChange={(data) => { setScheduleData(data); setScheduleError(null); }}
                        showScheduleTypeSelector={false}
                        error={scheduleError}
                    />
                </div>
            )}

            <button type="submit" className="btn btn-primary mt-4">
                {task?.id ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn btn-ghost mt-1" onClick={onClose}>
                Cancel
            </button>
        </form>
    );
}
