'use client';

import { useRouter } from 'next/navigation';
import { useRecommendations } from '@/hooks/api/use-recommendations';
import type { Recommendation } from '@/lib/services/recommendation-service';
import { RecommendationsList } from './RecommendationsList';
import { HighlightsSection } from './HighlightsSection';

const ACTION_ROUTES: Record<string, (rec: Recommendation) => string> = {
    create_task: () => '/tasks',
    create_goal: () => '/goals',
    create_skill: () => '/skills',
    link_tasks_to_goal: (rec) => `/goals/${rec.targetId}`,
    link_skill_to_goal: (rec) => `/skills/${rec.targetId}`,
    link_tasks_to_skill: (rec) => `/skills/${rec.targetId}`,
    complete_task: (rec) => `/tasks/${rec.targetId}`,
};

export const RecommendationsDashboard = () => {
    const router = useRouter();
    const { data, isLoading, isError, error } = useRecommendations();

    const handleAction = (recommendation: Recommendation) => {
        const getRoute = ACTION_ROUTES[recommendation.action];
        if (getRoute) {
            router.push(getRoute(recommendation));
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-16 w-full rounded-2xl"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-48 w-full rounded-2xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="alert alert-error">
                <span>{error?.message ?? 'Failed to load recommendations'}</span>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="flex flex-col gap-6">
            <section>
                <h2 className="text-lg font-semibold mb-3">Recommendations</h2>
                <RecommendationsList
                    recommendations={data.recommendations}
                    onAction={handleAction}
                />
            </section>
            <section>
                <h2 className="text-lg font-semibold mb-3">Highlights</h2>
                <HighlightsSection highlights={data.highlights} />
            </section>
        </div>
    );
};
