'use client';

import { useGoals } from "@/hooks/api/useGoals";
import { GoalCard } from "./GoalCard";

export function Goals() {
    const { data: goals } = useGoals();

    return (
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {goals?.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
            ))}
        </div>
    );
}