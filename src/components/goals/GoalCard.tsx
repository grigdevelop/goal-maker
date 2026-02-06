import Link from 'next/link';
import type { GetGoalsResponse } from '@/lib/services/goal-service';

type Goal = GetGoalsResponse[number];

type Props = {
    goal: Goal;
};

export const GoalCard = ({ goal }: Props) => {
    return (
        <div className="card card-border w-96">
            <div className="card-body">
                <h2 className="card-title">{goal.title}</h2>
                <p>{goal.description}</p>
                <div className="card-actions justify-end">
                    <Link href={`/goals/${goal.id}`} className="btn btn-primary">
                        Open
                    </Link>
                </div>
            </div>
        </div>
    )
};