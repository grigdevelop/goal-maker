'use client';

import Link from 'next/link';
import { Target, Zap, ListChecks } from 'lucide-react';
import type { RecommendationsResponse } from '@/lib/services/recommendation-service';

type Props = {
    highlights: RecommendationsResponse['highlights'];
};

function ProgressBar({ progress, label }: { progress: number; label: string }) {
    return (
        <div className="mt-1">
            <div className="flex items-center justify-between text-xs mb-1">
                <span className="opacity-60">{label}</span>
                <span className="font-mono">{progress}%</span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${progress >= 100 ? 'bg-success' : progress >= 50 ? 'bg-info' : 'bg-primary'}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
}

function HighlightColumn({
    title,
    icon: Icon,
    items,
}: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    items: { id: number; title: string; progress: number; entityType: string }[];
}) {
    return (
        <div className="card bg-base-300 border border-base-300 shadow-sm">
            <div className="card-body p-4">
                <h3 className="card-title text-sm flex items-center gap-2">
                    <Icon className="h-4 w-4 opacity-70" />
                    {title}
                </h3>
                {items.length === 0 ? (
                    <p className="text-xs opacity-50 py-2">No items yet</p>
                ) : (
                    <div className="flex flex-col gap-3 mt-1">
                        {items.map((item) => (
                            <Link
                                key={item.id}
                                href={`/${item.entityType}/${item.id}`}
                                className="block hover:bg-base-200 rounded-lg p-2 -mx-2 transition-colors"
                            >
                                <p className="text-sm font-medium truncate">{item.title}</p>
                                <ProgressBar progress={item.progress} label="Progress" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export const HighlightsSection = ({ highlights }: Props) => {
    const goalItems = highlights.topGoals.map((g) => ({
        id: g.id,
        title: g.title,
        progress: g.progress,
        entityType: 'goals',
    }));

    const skillItems = highlights.topSkills.map((s) => ({
        id: s.id,
        title: s.title,
        progress: s.progress,
        entityType: 'skills',
    }));

    const taskItems = highlights.topTasks.map((t) => ({
        id: t.id,
        title: t.title,
        progress: 'progress' in t ? (t as { progress: number }).progress : 0,
        entityType: 'tasks',
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HighlightColumn title="Top Goals" icon={Target} items={goalItems} />
            <HighlightColumn title="Top Skills" icon={Zap} items={skillItems} />
            <HighlightColumn title="Top Tasks" icon={ListChecks} items={taskItems} />
        </div>
    );
};
