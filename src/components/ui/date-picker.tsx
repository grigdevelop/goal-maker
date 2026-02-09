'use client';

import { useCallback, useId, useRef, useEffect, useState } from 'react';
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

function useCurrentDate() {
    const [date] = useState<Date>(() => new Date());
    return date;
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
    const currentDate = useCurrentDate();

    const selectedDate = parseDate(value);
    const minDate = parseDate(min);
    const maxDate = parseDate(max);

    const handleSelect = useCallback((date: Date | undefined) => {
        if (!date) return;
        onChange(formatDate(date));
        if (typeof popoverRef.current?.hidePopover === 'function') {
            popoverRef.current.hidePopover();
        }
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
                aria-haspopup="dialog"
                aria-expanded={false}
                aria-label={selectedDate ? `Selected date: ${formatDisplay(selectedDate)}` : placeholder}
            >
                <Calendar className="h-4 w-4 opacity-50 shrink-0" aria-hidden="true" />
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
                role="dialog"
                aria-label="Date picker"
            >
                <DayPicker
                    key={value ?? 'empty'}
                    className="react-day-picker"
                    mode="single"
                    fixedWeeks
                    selected={selectedDate}
                    onSelect={handleSelect}
                    defaultMonth={selectedDate ?? currentDate}
                    disabled={[
                        ...(minDate ? [{ before: minDate }] : []),
                        ...(maxDate ? [{ after: maxDate }] : []),
                    ]}
                    today={currentDate}
                />
            </div>
        </>
    );
}
