'use client';

import { useTasks } from "@/hooks/api/use-tasks";
import { TaskCard } from "./TaskCard";
import { CreateTaskBtn } from "./CreateTaskBtn";

export function Tasks() {
    const { data: tasks } = useTasks();

    if (!tasks || tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-base-200 rounded-full p-6 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1">No tasks yet</h3>
                <p className="text-sm opacity-60 mb-4 text-center max-w-xs">
                    Tasks are actionable steps toward your goals. Create your first task to start making progress.
                </p>
                <CreateTaskBtn />
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
            ))}
        </div>
    );
}
