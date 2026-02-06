'use client';

import { Suspense } from "react";
import { SkillInfo, SkillInfoLoading } from "./SkillInfo";
import { useSkill } from "@/hooks/api/use-skills";

type Props = {
    skillId: number;
}

function SkillContent({ skillId }: Props) {
    const { data: skill } = useSkill(skillId);

    if (!skill) {
        return <SkillInfoLoading />;
    }

    return <SkillInfo skill={skill} />;
}

export function Skill({ skillId }: Props) {
    return (
        <div>
            <Suspense fallback={<SkillInfoLoading />}>
                <SkillContent skillId={skillId} />
            </Suspense>
        </div>
    )
}
