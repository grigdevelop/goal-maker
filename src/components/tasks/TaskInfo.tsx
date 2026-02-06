import type { GetTaskByIdResponse } from '@/lib/services/task-service';

type Props = {
    task: GetTaskByIdResponse;
}

export function TaskInfo({ task }: Props) {
    return (
        <div className="card card-border">
            <div className="card-body">
                <h1 className="card-title text-2xl">{task?.title}</h1>
                <p className="text-base">{task?.description}</p>
            </div>
        </div>
    )
}

export function TaskInfoLoading() {
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
