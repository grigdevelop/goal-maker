'use client';

import { useCallback, useId, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import { Calendar } from 'lucide-react';

type DatePickerProps = {
    value?: string;
    onChange: (value: string) => void;
    min?: string;
    max?: string;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
};

function parseDate(dateStr: string | undefined): Date | undefined {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatDisplay(date: Date): string {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function DatePicker({
    value,
    onChange,
    min,
    max,
    disabled = false,
    placeholder = 'Pick a date',
    className = '',
    size = 'sm',
}: DatePickerProps) {
    const popoverId = useId();
    const anchorName = `--datepicker-${popoverId.replace(/:/g, '')}`;
    const popoverRef = useRef<HTMLDivElement>(null);

    const selectedDate = parseDate(value);
    const minDate = parseDate(min);
    const maxDate = parseDate(max);

    const handleSelect = useCallback((date: Date | undefined) => {
        if (!date) return;
        onChange(formatDate(date));
        popoverRef.current?.hidePopover();
    }, [onChange]);

    const sizeClass = size === 'sm' ? 'input-sm' : size === 'lg' ? 'input-lg' : '';

    return (
        <>
            <button
                type="button"
                popoverTarget={popoverId}
                className={`input input-border ${sizeClass} flex items-center gap-2 cursor-pointer w-full text-left ${className}`}
                style={{ anchorName } as React.CSSProperties}
                disabled={disabled}
            >
                <Calendar className="h-4 w-4 opacity-50 shrink-0" />
                <span className={selectedDate ? '' : 'opacity-50'}>
                    {selectedDate ? formatDisplay(selectedDate) : placeholder}
                </span>
            </button>
            <div
                ref={popoverRef}
                popover="auto"
                id={popoverId}
                className="dropdown"
                style={{ positionAnchor: anchorName } as React.CSSProperties}
            >
                <DayPicker
                    key={value ?? 'empty'}
                    className="react-day-picker"
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleSelect}
                    defaultMonth={selectedDate ?? new Date()}
                    disabled={[
                        ...(minDate ? [{ before: minDate }] : []),
                        ...(maxDate ? [{ after: maxDate }] : []),
                    ]}
                    today={new Date()}
                />
            </div>
        </>
    );
}
