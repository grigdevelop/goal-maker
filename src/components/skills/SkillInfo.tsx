import type { GetSkillByIdResponse } from '@/lib/services/skill-service';

type Props = {
    skill: GetSkillByIdResponse;
}

export function SkillInfo({ skill }: Props) {
    return (
        <div className="card card-border">
            <div className="card-body">
                <h1 className="card-title text-2xl">{skill?.title}</h1>
                <p className="text-base">{skill?.description}</p>
            </div>
        </div>
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
