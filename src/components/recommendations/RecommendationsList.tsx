'use client';

import { Lightbulb } from 'lucide-react';
import type { Recommendation } from '@/lib/services/recommendation-service';
import { RecommendationCard } from './RecommendationCard';

type Props = {
    recommendations: Recommendation[];
    onAction: (recommendation: Recommendation) => void;
};

const PRIORITY_ORDER: Record<Recommendation['priority'], number> = {
    high: 0,
    medium: 1,
    low: 2,
};

export const RecommendationsList = ({ recommendations, onAction }: Props) => {
    const sorted = [...recommendations].sort(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    );

    if (sorted.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="bg-base-200 rounded-full p-6 mb-4">
                    <Lightbulb className="h-10 w-10 opacity-40" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No recommendations</h3>
                <p className="text-sm opacity-60 text-center max-w-xs">
                    You&apos;re all caught up! Keep working on your goals and tasks.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {sorted.map((rec, i) => (
                <RecommendationCard
                    key={`${rec.action}-${rec.targetId ?? i}`}
                    recommendation={rec}
                    onAction={onAction}
                />
            ))}
        </div>
    );
};
