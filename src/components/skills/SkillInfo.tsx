'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GetSkillByIdResponse } from '@/lib/services/skill-service';
import { useSkillMutations } from '@/hooks/api/use-skill-mutations';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

type Props = {
    skill: GetSkillByIdResponse;
}

export function SkillInfo({ skill }: Props) {
    const router = useRouter();
    const { deleteMutation } = useSkillMutations();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = () => {
        if (!skill) return;
        deleteMutation.mutate(String(skill.id), {
            onSuccess: () => {
                router.push('/skills');
            },
        });
    };

    return (
        <>
            <div className="card card-border">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="card-title text-2xl">{skill?.title}</h1>
                            <p className="text-base mt-2">{skill?.description}</p>
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
