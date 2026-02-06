import Link from 'next/link';
import type { GetTasksResponse } from '@/lib/services/task-service';

type Task = GetTasksResponse[number];

type Props = {
    task: Task;
};

export const TaskCard = ({ task }: Props) => {
    return (
        <div className="card card-border w-96">
            <div className="card-body">
                <h2 className="card-title">{task.title}</h2>
                <p>{task.description}</p>
                <div className="card-actions justify-end">
                    <Link href={`/tasks/${task.id}`} className="btn btn-primary">
                        Open
                    </Link>
                </div>
            </div>
        </div>
    )
};
