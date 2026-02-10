import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from 'better-auth';

export function useUserProfile() {
    return useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const response = await fetch('/api/user');
            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }
            return response.json() as Promise<User>;
        },
    });
}

export function useProfileImageMutations() {
    const queryClient = useQueryClient();

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/user/profile-image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to upload image');
            }

            return response.json() as Promise<User>;
        },
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(['user-profile'], updatedUser);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/user/profile-image', {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete image');
            }

            return response.json() as Promise<User>;
        },
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(['user-profile'], updatedUser);
        },
    });

    return { uploadMutation, deleteMutation };
}
