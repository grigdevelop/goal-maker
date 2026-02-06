import { useQuery } from '@tanstack/react-query';
import type { SkillWithProgress } from '@/lib/services/progress-service';

export function useSkills() {
    return useQuery({
        queryKey: ['skills'],
        queryFn: async () => {
            const response = await fetch('/api/skills');
            if (!response.ok) {
                throw new Error('Failed to fetch skills');
            }
            const data = await response.json();
            return data as SkillWithProgress[];
        },
    });
}

export function useSkill(id: number) {
    return useQuery({
        queryKey: ['skill', id],
        queryFn: async () => {
            const response = await fetch(`/api/skills/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch skill');
            }
            const data = await response.json();
            return data as SkillWithProgress;
        },
        enabled: !!id,
    });
}
