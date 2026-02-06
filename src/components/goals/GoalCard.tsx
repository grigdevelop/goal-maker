import Link from 'next/link';
import type { GoalWithProgress } from '@/lib/services/progress-service';
import { EntityCard } from '../shared/EntityCard';

type Props = {
    goal: GoalWithProgress;
};

export const GoalCard = ({ goal }: Props) => {
    return (
        <EntityCard
            id={goal.id}
            entityType="goals"
            aria-label={`Open goal: ${goal.title}`}
        >
            <div className="card-body">
                <h2 className="card-title">{goal.title}</h2>
                {goal.description && <p className="text-sm opacity-70 line-clamp-2">{goal.description}</p>}
                <div className="mt-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="opacity-60">Progress</span>
                        <span className="font-mono">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${goal.progress >= 100 ? 'bg-success' : goal.progress >= 50 ? 'bg-info' : 'bg-primary'
                                }`}
                            style={{ width: `${goal.progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </EntityCard>
    )
};