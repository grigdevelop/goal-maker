import Link from 'next/link';
import type { SkillWithProgress } from '@/lib/services/progress-service';
import { EntityCard } from '../shared/EntityCard';

type Props = {
    skill: SkillWithProgress;
};

export const SkillCard = ({ skill }: Props) => {
    return (
        <EntityCard
            id={skill.id}
            entityType="skills"
            aria-label={`Open skill: ${skill.title}`}
        >
            <div className="card-body">
                <h2 className="card-title">{skill.title}</h2>
                {skill.description && <p className="text-sm opacity-70 line-clamp-2">{skill.description}</p>}
                <div className="mt-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="opacity-60">Progress</span>
                        <span className="font-mono">{skill.progress}%</span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${skill.progress >= 100 ? 'bg-success' : skill.progress >= 50 ? 'bg-info' : 'bg-primary'
                                }`}
                            style={{ width: `${skill.progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </EntityCard>
    )
};
