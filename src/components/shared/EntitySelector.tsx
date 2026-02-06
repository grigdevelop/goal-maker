'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

type Entity = {
    id: number;
    title: string;
};

type Props = {
    label: string;
    entities: Entity[];
    excludeIds: number[];
    onSelect: (id: number) => void;
    onCreate: (title: string) => void;
    loading?: boolean;
};

export function EntitySelector({ label, entities, excludeIds, onSelect, onCreate, loading = false }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filtered = entities
        .filter((e) => !excludeIds.includes(e.id))
        .filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (id: number) => {
        onSelect(id);
        setIsOpen(false);
        setSearch('');
    };

    const handleCreate = () => {
        if (!search.trim()) return;
        onCreate(search.trim());
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="btn btn-sm btn-ghost gap-1"
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
            >
                {loading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                ) : (
                    <Plus className="h-4 w-4" />
                )}
                {label}
            </button>
            {isOpen && (
                <div className="absolute z-50 mt-1 w-64 bg-base-100 border border-base-300 rounded-lg shadow-lg">
                    <div className="p-2">
                        <input
                            type="text"
                            className="input input-sm input-bordered w-full"
                            placeholder="Search or create..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && search.trim() && filtered.length === 0) {
                                    handleCreate();
                                }
                                if (e.key === 'Escape') {
                                    setIsOpen(false);
                                    setSearch('');
                                }
                            }}
                        />
                    </div>
                    <ul className="menu menu-sm max-h-48 overflow-y-auto flex-nowrap p-1">
                        {filtered.map((entity) => (
                            <li key={entity.id}>
                                <button onClick={() => handleSelect(entity.id)}>
                                    {entity.title}
                                </button>
                            </li>
                        ))}
                        {filtered.length === 0 && search.trim() && (
                            <li>
                                <button onClick={handleCreate} className="text-primary">
                                    <Plus className="h-3 w-3" />
                                    Create &quot;{search.trim()}&quot;
                                </button>
                            </li>
                        )}
                        {filtered.length === 0 && !search.trim() && (
                            <li className="disabled">
                                <span className="text-base-content/50">No items available</span>
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
