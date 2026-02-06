'use client';

import React from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

type Entity = {
    id: number;
    title: string;
};

type Props = {
    title: string;
    items: Entity[];
    loading?: boolean;
    linkPrefix: string;
    onRemove?: (id: number) => void;
    removeLoading?: boolean;
    children?: React.ReactNode;
};

export function RelationshipManager({
    title,
    items,
    loading = false,
    linkPrefix,
    onRemove,
    removeLoading = false,
    children,
}: Props) {
    return (
        <div className="card card-border">
            <div className="card-body">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="card-title text-lg">{title}</h2>
                    {children}
                </div>
                {loading ? (
                    <div className="space-y-2">
                        <div className="skeleton h-8 w-full"></div>
                        <div className="skeleton h-8 w-full"></div>
                        <div className="skeleton h-8 w-3/4"></div>
                    </div>
                ) : items.length === 0 ? (
                    <p className="text-base-content/50 text-sm">No items yet.</p>
                ) : (
                    <ul className="space-y-1">
                        {items.map((item) => (
                            <li key={item.id} className="flex items-center justify-between group rounded-lg px-3 py-2 hover:bg-base-200 transition-colors">
                                <Link
                                    href={`${linkPrefix}/${item.id}`}
                                    className="text-sm hover:underline flex-1"
                                >
                                    {item.title}
                                </Link>
                                {onRemove && (
                                    <button
                                        className="btn btn-ghost btn-xs btn-square opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => onRemove(item.id)}
                                        disabled={removeLoading}
                                        title="Remove"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
