import type { GetGoalByIdResponse } from '@/lib/services/goal-service';

type Props = {
    goal: GetGoalByIdResponse;
}

export function GoalInfo({ goal }: Props) {
    return (
        <div className="card card-border">
            <div className="card-body">
                <h1 className="card-title text-2xl">{goal?.title}</h1>
                <p className="text-base">{goal?.description}</p>
            </div>
        </div>
    )
}

export function GoalInfoLoading() {
    return (
        <div className="card card-border">
            <div className="card-body">
                <div className="skeleton h-8 w-3/4 mb-4"></div>
                <div className="skeleton h-4 w-full mb-2"></div>
                <div className="skeleton h-4 w-full mb-2"></div>
                <div className="skeleton h-4 w-2/3"></div>
            </div>
        </div>
    )
}