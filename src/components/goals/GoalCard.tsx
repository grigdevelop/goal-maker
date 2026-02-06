import Link from 'next/link';
import type { GetGoalsResponse } from '@/lib/services/goal-service';
import { EntityCard } from '../shared/EntityCard';

type Goal = GetGoalsResponse[number];

type Props = {
    goal: Goal;
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
                <p>{goal.description}</p>
            </div>
        </EntityCard>
    )
};