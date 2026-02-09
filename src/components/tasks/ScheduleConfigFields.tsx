'use client';

import { useState, useCallback } from 'react';
import { ScheduleType } from '@/lib/constants/task';
import { DatePicker } from '@/components/ui/date-picker';
import type { ScheduleType as ScheduleTypeType, ScheduleConfig, DailyConfig, WeeklyConfig, MonthlyConfig, CustomConfig } from '@/lib/constants/task';

const SCHEDULE_TYPE_LABEL: Record<string, string> = {
    [ScheduleType.DAILY]: 'Daily',
    [ScheduleType.WEEKLY]: 'Weekly',
    [ScheduleType.MONTHLY]: 'Monthly',
    [ScheduleType.CUSTOM]: 'Custom Dates',
};

const DAYS_OF_WEEK = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 0, label: 'Sun' },
];

export type ScheduleFormData = {
    scheduleType: ScheduleTypeType;
    daysOfWeek: number[];
    daysOfMonth: number[];
    customDates: string[];
};

type Props = {
    value: ScheduleFormData;
    onChange: (data: ScheduleFormData) => void;
    showScheduleTypeSelector?: boolean;
    error?: string | null;
};

export function getDefaultScheduleFormData(scheduleType?: ScheduleTypeType): ScheduleFormData {
    return {
        scheduleType: scheduleType ?? ScheduleType.DAILY,
        daysOfWeek: [],
        daysOfMonth: [],
        customDates: [],
    };
}

export function parseScheduleToFormData(
    scheduleType: string,
    configJson: string
): ScheduleFormData {
    const data = getDefaultScheduleFormData(scheduleType as ScheduleTypeType);
    try {
        const config = JSON.parse(configJson);
        if (scheduleType === ScheduleType.WEEKLY && Array.isArray(config.daysOfWeek)) {
            data.daysOfWeek = config.daysOfWeek;
        }
        if (scheduleType === ScheduleType.MONTHLY && Array.isArray(config.daysOfMonth)) {
            data.daysOfMonth = config.daysOfMonth;
        }
        if (scheduleType === ScheduleType.CUSTOM && Array.isArray(config.dates)) {
            data.customDates = config.dates;
        }
    } catch {
        // ignore parse errors
    }
    return data;
}

export function scheduleFormDataToConfig(data: ScheduleFormData): ScheduleConfig {
    switch (data.scheduleType) {
        case ScheduleType.DAILY:
            return { enabled: true } as DailyConfig;
        case ScheduleType.WEEKLY:
            return { daysOfWeek: data.daysOfWeek } as WeeklyConfig;
        case ScheduleType.MONTHLY:
            return { daysOfMonth: data.daysOfMonth } as MonthlyConfig;
        case ScheduleType.CUSTOM:
            return { dates: data.customDates } as CustomConfig;
    }
}

export function validateScheduleFormData(data: ScheduleFormData): string | null {
    switch (data.scheduleType) {
        case ScheduleType.DAILY:
            return null;
        case ScheduleType.WEEKLY:
            return data.daysOfWeek.length === 0 ? 'Select at least one day of the week' : null;
        case ScheduleType.MONTHLY:
            return data.daysOfMonth.length === 0 ? 'Select at least one day of the month' : null;
        case ScheduleType.CUSTOM:
            return data.customDates.length === 0 ? 'Add at least one date' : null;
        default:
            return null;
    }
}

export function ScheduleConfigFields({ value, onChange, showScheduleTypeSelector = true, error }: Props) {
    const [dateInput, setDateInput] = useState('');

    const handleScheduleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ ...value, scheduleType: e.target.value as ScheduleTypeType });
    }, [value, onChange]);

    const toggleDayOfWeek = useCallback((day: number) => {
        const current = value.daysOfWeek;
        const next = current.includes(day)
            ? current.filter((d) => d !== day)
            : [...current, day].sort((a, b) => a - b);
        onChange({ ...value, daysOfWeek: next });
    }, [value, onChange]);

    const toggleDayOfMonth = useCallback((day: number) => {
        const current = value.daysOfMonth;
        const next = current.includes(day)
            ? current.filter((d) => d !== day)
            : [...current, day].sort((a, b) => a - b);
        onChange({ ...value, daysOfMonth: next });
    }, [value, onChange]);

    const addCustomDate = useCallback(() => {
        if (!dateInput) return;
        if (value.customDates.includes(dateInput)) return;
        const next = [...value.customDates, dateInput].sort();
        onChange({ ...value, customDates: next });
        setDateInput('');
    }, [dateInput, value, onChange]);

    const removeCustomDate = useCallback((date: string) => {
        onChange({ ...value, customDates: value.customDates.filter((d) => d !== date) });
    }, [value, onChange]);

    return (
        <div className="space-y-3">
            {showScheduleTypeSelector && (
                <fieldset className="fieldset">
                    <label className="label">Schedule Type <span className="text-error">*</span></label>
                    <select
                        className="select select-sm w-full"
                        value={value.scheduleType}
                        onChange={handleScheduleTypeChange}
                    >
                        {Object.entries(ScheduleType).map(([key, val]) => (
                            <option key={key} value={val}>
                                {SCHEDULE_TYPE_LABEL[val]}
                            </option>
                        ))}
                    </select>
                </fieldset>
            )}

            {/* DAILY — no extra config */}
            {value.scheduleType === ScheduleType.DAILY && (
                <p className="text-xs opacity-60">Task will activate every day.</p>
            )}

            {/* WEEKLY — day of week multi-select */}
            {value.scheduleType === ScheduleType.WEEKLY && (
                <fieldset className="fieldset">
                    <label className="label">Days of Week <span className="text-error">*</span></label>
                    <div className="flex flex-wrap gap-1.5">
                        {DAYS_OF_WEEK.map(({ value: day, label }) => (
                            <button
                                key={day}
                                type="button"
                                className={`btn btn-xs ${value.daysOfWeek.includes(day) ? 'btn-primary' : 'btn-ghost btn-outline'}`}
                                onClick={() => toggleDayOfWeek(day)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    {value.daysOfWeek.length > 0 && (
                        <span className="text-xs opacity-50 mt-1">
                            {value.daysOfWeek.map((d) => DAYS_OF_WEEK.find((dw) => dw.value === d)?.label).join(', ')}
                        </span>
                    )}
                </fieldset>
            )}

            {/* MONTHLY — day of month multi-select */}
            {value.scheduleType === ScheduleType.MONTHLY && (
                <fieldset className="fieldset">
                    <label className="label">Days of Month <span className="text-error">*</span></label>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <button
                                key={day}
                                type="button"
                                className={`btn btn-xs ${value.daysOfMonth.includes(day) ? 'btn-primary' : 'btn-ghost btn-outline'}`}
                                onClick={() => toggleDayOfMonth(day)}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                    {value.daysOfMonth.length > 0 && (
                        <span className="text-xs opacity-50 mt-1">
                            Selected: {value.daysOfMonth.join(', ')}
                        </span>
                    )}
                </fieldset>
            )}

            {/* CUSTOM — date picker */}
            {value.scheduleType === ScheduleType.CUSTOM && (
                <fieldset className="fieldset">
                    <label className="label">Specific Dates <span className="text-error">*</span></label>
                    <div className="flex gap-2 items-center">
                        <div className="flex-1">
                            <DatePicker
                                value={dateInput || undefined}
                                onChange={(val) => setDateInput(val)}
                                min={new Date().toISOString().split('T')[0]}
                                placeholder="Select a date"
                            />
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={addCustomDate}
                            disabled={!dateInput}
                        >
                            Add
                        </button>
                    </div>
                    {value.customDates.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {value.customDates.map((date) => (
                                <span key={date} className="badge badge-sm gap-1">
                                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    <button
                                        type="button"
                                        className="text-error hover:text-error-content font-bold"
                                        onClick={() => removeCustomDate(date)}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </fieldset>
            )}

            {error && <p className="text-error text-sm">{error}</p>}
        </div>
    );
}
