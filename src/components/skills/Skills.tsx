'use client';

import { useSkills } from "@/hooks/api/use-skills";
import { SkillCard } from "./SkillCard";
import { CreateSkillBtn } from "./CreateSkillBtn";

export function Skills() {
    const { data: skills } = useSkills();

    if (!skills || skills.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-base-200 rounded-full p-6 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1">No skills yet</h3>
                <p className="text-sm opacity-60 mb-4 text-center max-w-xs">
                    Skills represent abilities you want to develop. Create your first skill to start tracking your growth.
                </p>
                <CreateSkillBtn />
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
            ))}
        </div>
    );
}
