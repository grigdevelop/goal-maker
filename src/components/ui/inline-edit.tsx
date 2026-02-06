'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pencil, Check, X } from 'lucide-react';

type Props = {
    value: string;
    onSave: (value: string) => Promise<void> | void;
    as?: 'h1' | 'h2' | 'p' | 'span';
    className?: string;
    inputClassName?: string;
    multiline?: boolean;
    required?: boolean;
    placeholder?: string;
};

export function InlineEdit({
    value,
    onSave,
    as: Tag = 'span',
    className = '',
    inputClassName = '',
    multiline = false,
    required = true,
    placeholder = '',
}: Props) {
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [editing]);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    const startEditing = useCallback(() => {
        setEditValue(value);
        setError(null);
        setEditing(true);
    }, [value]);

    const cancel = useCallback(() => {
        setEditValue(value);
        setError(null);
        setEditing(false);
    }, [value]);

    const save = useCallback(async () => {
        const trimmed = editValue.trim();
        if (required && !trimmed) {
            setError('This field is required');
            return;
        }
        if (trimmed === value) {
            setEditing(false);
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await onSave(trimmed);
            setEditing(false);
        } catch {
            setError('Failed to save');
        } finally {
            setSaving(false);
        }
    }, [editValue, value, required, onSave]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            cancel();
        }
        if (e.key === 'Enter' && !multiline) {
            e.preventDefault();
            save();
        }
        if (e.key === 'Enter' && e.ctrlKey && multiline) {
            e.preventDefault();
            save();
        }
    }, [cancel, save, multiline]);

    if (editing) {
        return (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                    {multiline ? (
                        <textarea
                            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                            className={`textarea textarea-sm textarea-bordered w-full ${inputClassName}`}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={saving}
                            placeholder={placeholder}
                            rows={3}
                        />
                    ) : (
                        <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            type="text"
                            className={`input input-sm input-bordered w-full ${inputClassName}`}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={saving}
                            placeholder={placeholder}
                        />
                    )}
                    <button
                        className="btn btn-ghost btn-xs btn-square"
                        onClick={save}
                        disabled={saving}
                        title="Save (Enter)"
                    >
                        {saving ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <Check className="h-4 w-4 text-success" />
                        )}
                    </button>
                    <button
                        className="btn btn-ghost btn-xs btn-square"
                        onClick={cancel}
                        disabled={saving}
                        title="Cancel (Escape)"
                    >
                        <X className="h-4 w-4 text-error" />
                    </button>
                </div>
                {error && <span className="text-error text-xs">{error}</span>}
            </div>
        );
    }

    return (
        <div className="group inline-flex items-center gap-1">
            <Tag
                className={`cursor-pointer ${className}`}
                onDoubleClick={startEditing}
            >
                {value || <span className="text-base-content/40">{placeholder || 'Empty'}</span>}
            </Tag>
            <button
                className="btn btn-ghost btn-xs btn-square opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={startEditing}
                title="Edit"
            >
                <Pencil className="h-3 w-3" />
            </button>
        </div>
    );
}
