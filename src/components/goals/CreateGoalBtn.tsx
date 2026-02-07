'use client';

import React from 'react';
import { CreateOrUpdateGoalForm } from './CreateOrUpdateGoalForm';
import { useGoalMutations } from '@/hooks/api/use-goal-mutations';
import { useToast } from '@/components/ui/toast';
import { useDialog } from '@/components/shared/dialog';

type Goal = {
    title: string;
    description: string | null;
};

export const CreateGoalBtn: React.FC = () => {
    const { openDialog, closeDialog } = useDialog();
    const { createMutation } = useGoalMutations();
    const { success, error } = useToast();

    const handleSubmit = (goal: Goal) => {
        createMutation.mutate(
            { title: goal.title, description: goal.description },
            {
                onSuccess: () => {
                    closeDialog();
                    success('Goal created successfully');
                },
                onError: () => {
                    error('Failed to create goal');
                },
            }
        );
    };

    const handleClick = () => {
        openDialog(
            <CreateOrUpdateGoalForm onClose={closeDialog} onSubmit={handleSubmit} />
        );
    };

    return (
        <button onClick={handleClick} className="btn btn-sm" disabled={createMutation.isPending}>
            {createMutation.isPending && <span className="loading loading-spinner loading-sm"></span>}
            Create Goal
        </button>
    );
};