import Link from 'next/link';
import type { GetSkillsResponse } from '@/lib/services/skill-service';

type Skill = GetSkillsResponse[number];

type Props = {
    skill: Skill;
};

export const SkillCard = ({ skill }: Props) => {
    return (
        <div className="card card-border w-96">
            <div className="card-body">
                <h2 className="card-title">{skill.title}</h2>
                <p>{skill.description}</p>
                <div className="card-actions justify-end">
                    <Link href={`/skills/${skill.id}`} className="btn btn-primary">
                        Open
                    </Link>
                </div>
            </div>
        </div>
    )
};
