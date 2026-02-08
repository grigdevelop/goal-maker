'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { GoalWithProgress } from '@/lib/services/progress-service';
import { useGoalMutations } from '@/hooks/api/use-goal-mutations';
import { useGoalSkills, useGoalTasks, useGoalRelationMutations } from '@/hooks/api/use-goal-relations';
import { useSkills } from '@/hooks/api/use-skills';
import { useTasks } from '@/hooks/api/use-tasks';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { RelationshipManager } from '@/components/shared/RelationshipManager';
import { EntitySelector } from '@/components/shared/EntitySelector';
import { InlineEdit } from '@/components/ui/inline-edit';
import { useToast } from '@/components/ui/toast';
import { Trash } from 'lucide-react';

type Props = {
    goal: GoalWithProgress;
}

export function GoalInfo({ goal }: Props) {
    const router = useRouter();
    const { updateMutation, deleteMutation } = useGoalMutations();
    const [showConfirm, setShowConfirm] = useState(false);
    const { success, error } = useToast();

    const goalId = goal?.id ?? 0;
    const { data: relatedSkills = [], isLoading: skillsLoading } = useGoalSkills(goalId);
    const { data: relatedTasks = [], isLoading: tasksLoading } = useGoalTasks(goalId);
    const { data: allSkills = [] } = useSkills();
    const { data: allTasks = [] } = useTasks();
    const { addSkill, removeSkill, addTask, removeTask } = useGoalRelationMutations(goalId);

    const handleDelete = () => {
        if (!goal) return;
        deleteMutation.mutate(String(goal.id), {
            onSuccess: () => {
                success('Goal deleted successfully');
                router.push('/goals');
            },
            onError: () => {
                error('Failed to delete goal');
                setShowConfirm(false);
            },
        });
    };

    const handleSaveTitle = useCallback(async (newTitle: string) => {
        if (!goal) return;
        return new Promise<void>((resolve, reject) => {
            updateMutation.mutate(
                { id: String(goal.id), data: { title: newTitle, description: goal.description } },
                {
                    onSuccess: () => {
                        success('Title updated');
                        resolve();
                    },
                    onError: () => {
                        error('Failed to update title');
                        reject(new Error('Failed to update title'));
                    },
                }
            );
        });
    }, [goal, updateMutation, success, error]);

    const handleSaveDescription = useCallback(async (newDescription: string) => {
        if (!goal) return;
        return new Promise<void>((resolve, reject) => {
            updateMutation.mutate(
                { id: String(goal.id), data: { title: goal.title, description: newDescription || null } },
                {
                    onSuccess: () => {
                        success('Description updated');
                        resolve();
                    },
                    onError: () => {
                        error('Failed to update description');
                        reject(new Error('Failed to update description'));
                    },
                }
            );
        });
    }, [goal, updateMutation, success, error]);

    const handleAddSkill = (skillId: number) => {
        addSkill.mutate({ skillId }, {
            onSuccess: () => success('Skill added'),
            onError: () => error('Failed to add skill'),
        });
    };

    const handleCreateSkill = (title: string) => {
        addSkill.mutate({ title }, {
            onSuccess: () => success('Skill created and added'),
            onError: () => error('Failed to create skill'),
        });
    };

    const handleRemoveSkill = (skillId: number) => {
        removeSkill.mutate(skillId, {
            onSuccess: () => success('Skill removed'),
            onError: () => error('Failed to remove skill'),
        });
    };

    const handleAddTask = (taskId: number) => {
        addTask.mutate({ taskId }, {
            onSuccess: () => success('Task added'),
            onError: () => error('Failed to add task'),
        });
    };

    const handleCreateTask = (title: string) => {
        addTask.mutate({ title }, {
            onSuccess: () => success('Task created and added'),
            onError: () => error('Failed to create task'),
        });
    };

    const handleRemoveTask = (taskId: number) => {
        removeTask.mutate(taskId, {
            onSuccess: () => success('Task removed'),
            onError: () => error('Failed to remove task'),
        });
    };

    return (
        <>
            <div className="card card-border">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <InlineEdit
                                value={goal?.title ?? ''}
                                onSave={handleSaveTitle}
                                as="h1"
                                className="card-title text-2xl"
                            />
                            <div className="mt-2">
                                <InlineEdit
                                    value={goal?.description ?? ''}
                                    onSave={handleSaveDescription}
                                    as="p"
                                    className="text-base"
                                    multiline
                                    required={false}
                                    placeholder="Add a description..."
                                />
                            </div>
                        </div>
                        <button
                            className="btn btn-error btn-sm"
                            onClick={() => setShowConfirm(true)}
                            disabled={deleteMutation.isPending}
                        >
                            <Trash className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="card card-border mt-4">
                <div className="card-body p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">Progress</h3>
                        <span className="text-sm font-mono">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-4 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${goal.progress >= 100 ? 'bg-success' : goal.progress >= 50 ? 'bg-info' : 'bg-primary'
                                }`}
                            style={{ width: `${goal.progress}%` }}
                        ></div>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs opacity-60">
                        <span>{goal.taskCount} task{goal.taskCount !== 1 ? 's' : ''}</span>
                        <span>{goal.skillCount} skill{goal.skillCount !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <RelationshipManager
                    title="Skills"
                    items={relatedSkills}
                    loading={skillsLoading}
                    linkPrefix="/skills"
                    onRemove={handleRemoveSkill}
                    removeLoading={removeSkill.isPending}
                >
                    <EntitySelector
                        label="Add Skill"
                        entities={allSkills}
                        excludeIds={relatedSkills.map((s) => s.id)}
                        onSelect={handleAddSkill}
                        onCreate={handleCreateSkill}
                        loading={addSkill.isPending}
                    />
                </RelationshipManager>

                <RelationshipManager
                    title="Tasks"
                    items={relatedTasks}
                    loading={tasksLoading}
                    linkPrefix="/tasks"
                    onRemove={handleRemoveTask}
                    removeLoading={removeTask.isPending}
                >
                    <EntitySelector
                        label="Add Task"
                        entities={allTasks}
                        excludeIds={relatedTasks.map((t) => t.id)}
                        onSelect={handleAddTask}
                        onCreate={handleCreateTask}
                        loading={addTask.isPending}
                    />
                </RelationshipManager>
            </div>

            <ConfirmDialog
                open={showConfirm}
                title="Delete Goal"
                message={`Are you sure you want to delete "${goal?.title}"? This action cannot be undone.`}
                loading={deleteMutation.isPending}
                onConfirm={handleDelete}
                onCancel={() => setShowConfirm(false)}
            />
        </>
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