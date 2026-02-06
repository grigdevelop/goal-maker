'use client';

import { useTasks } from "@/hooks/api/use-tasks";
import { TaskCard } from "./TaskCard";

export function Tasks() {
    const { data: tasks } = useTasks();

    return (
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {tasks?.map((task) => (
                <TaskCard key={task.id} task={task} />
            ))}
        </div>
    );
}
