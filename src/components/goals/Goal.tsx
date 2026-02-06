'use client';

import { Suspense } from "react";
import { GoalInfo, GoalInfoLoading } from "./GoalInfo";
import { useGoal } from "@/hooks/api/use-goals";

type Props = {
    goalId: number;
}

function GoalContent({ goalId }: Props) {
    const { data: goal } = useGoal(goalId);

    if (!goal) {
        return <GoalInfoLoading />;
    }

    return <GoalInfo goal={goal} />;
}

export function Goal({ goalId }: Props) {
    return (
        <div>
            <Suspense fallback={<GoalInfoLoading />}>
                <GoalContent goalId={goalId} />
            </Suspense>
        </div>
    )
}