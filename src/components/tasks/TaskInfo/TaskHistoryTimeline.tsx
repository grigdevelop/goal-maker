'use client';

import { useTaskHistory } from '@/hooks/api/use-tasks';
import { TaskStatus } from '@/lib/constants/task';
import { STATUS_BADGE, STATUS_LABEL, REASON_LABEL } from './constants';

type Props = {
    taskId: number;
};

export function TaskHistoryTimeline({ taskId }: Props) {
    const { data: history = [] } = useTaskHistory(taskId, 20);

    if (history.length === 0) return null;

    return (
        <div className="card card-border mt-4">
            <div className="card-body p-4">
                <h3 className="font-semibold text-sm mb-3">History</h3>
                <ul className="timeline timeline-vertical timeline-compact">
                    {history.map((entry, i) => (
                        <li key={entry.id}>
                            {i !== 0 && <hr />}
                            <div className="timeline-start text-xs opacity-50">
                                {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                })}
                            </div>
                            <div className="timeline-middle">
                                <div className={`w-2.5 h-2.5 rounded-full ${entry.status === TaskStatus.DONE ? 'bg-success' :
                                    entry.status === TaskStatus.IN_PROGRESS ? 'bg-warning' :
                                        'bg-base-300'
                                    }`}></div>
                            </div>
                            <div className="timeline-end timeline-box py-1.5 px-3">
                                <span className={`badge badge-xs mr-1 ${STATUS_BADGE[entry.status] ?? ''}`}>
                                    {STATUS_LABEL[entry.status] ?? entry.status}
                                </span>
                                <span className="text-xs opacity-70">
                                    {REASON_LABEL[entry.changeReason ?? ''] ?? entry.changeReason ?? ''}
                                </span>
                            </div>
                            {i !== history.length - 1 && <hr />}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
