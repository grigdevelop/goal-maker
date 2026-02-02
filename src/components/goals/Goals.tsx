'use client';

import { useGoals } from "@/hooks/api/useGoals";

export function Goals() {
    const { data: goals } = useGoals();

    return (
        <div>
            <h1>Goals</h1>
            {goals?.map((goal) => (
                <div key={goal.id}>
                    <h2>{goal.title}</h2>
                    <p>{goal.description}</p>
                </div>
            ))}
        </div>
    );
}