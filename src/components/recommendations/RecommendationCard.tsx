'use client';

import { Plus, Link, CheckCircle } from 'lucide-react';
import type { Recommendation } from '@/lib/services/recommendation-service';

type Props = {
    recommendation: Recommendation;
    onAction: (recommendation: Recommendation) => void;
};

const TYPE_ICON = {
    create: Plus,
    link: Link,
    complete: CheckCircle,
} as const;

const PRIORITY_BADGE: Record<Recommendation['priority'], string> = {
    high: 'badge-error',
    medium: 'badge-warning',
    low: 'badge-success',
};

const PRIORITY_LABEL: Record<Recommendation['priority'], string> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
};

export const RecommendationCard = ({ recommendation, onAction }: Props) => {
    const Icon = TYPE_ICON[recommendation.type];

    return (
        <div className="card bg-base-300 border border-base-300 shadow-sm">
            <div className="card-body p-4 flex-row items-center gap-3">
                <div className="flex-shrink-0">
                    <Icon className="h-5 w-5 opacity-70" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{recommendation.message}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge badge-sm ${PRIORITY_BADGE[recommendation.priority]}`}>
                        {PRIORITY_LABEL[recommendation.priority]}
                    </span>
                    <button
                        className="btn btn-primary btn-sm btn-outline"
                        onClick={() => onAction(recommendation)}
                    >
                        Go
                    </button>
                </div>
            </div>
        </div>
    );
};
