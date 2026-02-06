'use client';

import { Suspense } from "react";
import { TaskInfo, TaskInfoLoading } from "./TaskInfo";
import { useTask } from "@/hooks/api/use-tasks";

type Props = {
    taskId: number;
}

function TaskContent({ taskId }: Props) {
    const { data: task } = useTask(taskId);

    if (!task) {
        return <TaskInfoLoading />;
    }

    return <TaskInfo task={task} />;
}

export function Task({ taskId }: Props) {
    return (
        <div>
            <Suspense fallback={<TaskInfoLoading />}>
                <TaskContent taskId={taskId} />
            </Suspense>
        </div>
    )
}
