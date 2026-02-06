'use client';

import { useForm } from "react-hook-form";
import type { SkillInput } from "@/schemas/skill.schema";

type Props = {
    skill?: SkillInput;
    onSubmit: (skill: SkillInput) => void;
    onClose: () => void;
};

type FormData = {
    title: string;
    description: string;
};

export function CreateOrUpdateSkillForm({ skill, onSubmit, onClose }: Props) {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            title: skill?.title || '',
            description: skill?.description || '',
        }
    });

    const onSubmitHandler = (data: FormData) => {
        onSubmit({
            id: skill?.id,
            title: data.title,
            description: data.description || null,
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmitHandler)} className="fieldset">
            <legend className="fieldset-legend text-lg font-semibold pt-0">{skill ? 'Update Skill' : 'Create Skill'}</legend>

            <fieldset className="fieldset">
                <label className="label">Title</label>
                <input
                    type="text"
                    className="input input-sm w-full"
                    placeholder="Skill title"
                    {...register('title', {
                        required: 'Title is required'
                    })}
                />
                {errors.title && <span className="text-error text-sm">{errors.title.message}</span>}
            </fieldset>

            <label className="fieldset">
                <span className="label">Description</span>
                <textarea
                    className="textarea textarea-sm w-full"
                    placeholder="Skill description"
                    {...register('description')}
                />
            </label>

            <button type="submit" className="btn btn-primary mt-4">
                {skill ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn btn-ghost mt-1" onClick={onClose}>
                Cancel
            </button>
        </form>
    );
}
