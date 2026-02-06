'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { GetSkillByIdResponse } from '@/lib/services/skill-service';
import { useSkillMutations } from '@/hooks/api/use-skill-mutations';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { InlineEdit } from '@/components/ui/inline-edit';
import { useToast } from '@/components/ui/toast';

type Props = {
    skill: GetSkillByIdResponse;
}

export function SkillInfo({ skill }: Props) {
    const router = useRouter();
    const { updateMutation, deleteMutation } = useSkillMutations();
    const [showConfirm, setShowConfirm] = useState(false);
    const { success, error } = useToast();

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
