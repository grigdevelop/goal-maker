import { useQuery } from '@tanstack/react-query';
import type { RecommendationsResponse } from '@/lib/services/recommendation-service';

export function useRecommendations() {
    return useQuery({
        queryKey: ['recommendations'],
        queryFn: async () => {
            const response = await fetch('/api/recommendations');
            if (!response.ok) {
                throw new Error('Failed to fetch recommendations');
            }
            const data = await response.json();
            return data as RecommendationsResponse;
        },
    });
}
