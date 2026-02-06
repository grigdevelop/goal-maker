import Link from 'next/link';
import type { GetSkillsResponse } from '@/lib/services/skill-service';
import { EntityCard } from '../shared/EntityCard';

type Skill = GetSkillsResponse[number];

type Props = {
    skill: Skill;
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
                <p>{skill.description}</p>
            </div>
        </EntityCard>
    )
};
