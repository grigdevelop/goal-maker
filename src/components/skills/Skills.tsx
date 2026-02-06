'use client';

import { useSkills } from "@/hooks/api/use-skills";
import { SkillCard } from "./SkillCard";

export function Skills() {
    const { data: skills } = useSkills();

    return (
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {skills?.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
            ))}
        </div>
    );
}
