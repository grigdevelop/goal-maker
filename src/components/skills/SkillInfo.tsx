'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SkillWithProgress } from '@/lib/services/progress-service';
import { useSkillMutations } from '@/hooks/api/use-skill-mutations';
import { useSkillTasks, useSkillGoals, useSkillRelationMutations } from '@/hooks/api/use-skill-relations';
import { useTasks } from '@/hooks/api/use-tasks';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { RelationshipManager } from '@/components/shared/RelationshipManager';
import { EntitySelector } from '@/components/shared/EntitySelector';
import { InlineEdit } from '@/components/ui/inline-edit';
import { useToast } from '@/components/ui/toast';

type Props = {
    skill: SkillWithProgress;
}

export function SkillInfo({ skill }: Props) {
    const router = useRouter();
    const { updateMutation, deleteMutation } = useSkillMutations();
    const [showConfirm, setShowConfirm] = useState(false);
    const { success, error } = useToast();

    const skillId = skill?.id ?? 0;
    const { data: relatedTasks = [], isLoading: tasksLoading } = useSkillTasks(skillId);
    const { data: relatedGoals = [], isLoading: goalsLoading } = useSkillGoals(skillId);
    const { data: allTasks = [] } = useTasks();
    const { addTask, removeTask } = useSkillRelationMutations(skillId);

    const handleDelete = () => {
        if (!skill) return;
        deleteMutation.mutate(String(skill.id), {
            onSuccess: () => {
                success('Skill deleted successfully');
                router.push('/skills');
            },
            onError: () => {
                error('Failed to delete skill');
                setShowConfirm(false);
            },
        });
    };

    const handleSaveTitle = useCallback(async (newTitle: string) => {
        if (!skill) return;
        return new Promise<void>((resolve, reject) => {
            updateMutation.mutate(
                { id: String(skill.id), data: { title: newTitle, description: skill.description } },
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
    }, [skill, updateMutation, success, error]);

    const handleSaveDescription = useCallback(async (newDescription: string) => {
        if (!skill) return;
        return new Promise<void>((resolve, reject) => {
            updateMutation.mutate(
                { id: String(skill.id), data: { title: skill.title, description: newDescription || null } },
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
    }, [skill, updateMutation, success, error]);

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
                                value={skill?.title ?? ''}
                                onSave={handleSaveTitle}
                                as="h1"
                                className="card-title text-2xl"
                            />
                            <div className="mt-2">
                                <InlineEdit
                                    value={skill?.description ?? ''}
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
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="card card-border mt-4">
                <div className="card-body p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">Progress</h3>
                        <span className="text-sm font-mono">{skill.progress}%</span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-4 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${skill.progress >= 100 ? 'bg-success' : skill.progress >= 50 ? 'bg-info' : 'bg-primary'
                                }`}
                            style={{ width: `${skill.progress}%` }}
                        ></div>
                    </div>
                    <div className="mt-2 text-xs opacity-60">
                        <span>{skill.taskCount} task{skill.taskCount !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

                <RelationshipManager
                    title="Associated Goals"
                    items={relatedGoals}
                    loading={goalsLoading}
                    linkPrefix="/goals"
                />
            </div>

            <ConfirmDialog
                open={showConfirm}
                title="Delete Skill"
                message={`Are you sure you want to delete "${skill?.title}"? This action cannot be undone.`}
                loading={deleteMutation.isPending}
                onConfirm={handleDelete}
                onCancel={() => setShowConfirm(false)}
            />
        </>
    )
}

export function SkillInfoLoading() {
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
