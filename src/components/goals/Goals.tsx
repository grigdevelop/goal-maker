'use client';

import { useGoals } from "@/hooks/api/use-goals";
import { GoalCard } from "./GoalCard";
import { CreateGoalBtn } from "./CreateGoalBtn";

export function Goals() {
    const { data: goals } = useGoals();

    if (!goals || goals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-base-200 rounded-full p-6 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v18h18M9 17V9m4 8v-4m4 4V5" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1">No goals yet</h3>
                <p className="text-sm opacity-60 mb-4 text-center max-w-xs">
                    Goals help you stay focused on what matters most. Create your first goal to get started.
                </p>
                <CreateGoalBtn />
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
            ))}
        </div>
    );
}