'use client';

import { ProfileImageUploader, UserProfileCard } from '@/components/user-profile';
import { useUserProfile } from '@/hooks/api/use-user-profile';

export default function UserProfilePage() {
    const { data: user, isLoading, error } = useUserProfile();

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="alert alert-error max-w-md mx-auto mt-8">
                <span>Failed to load profile</span>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Your Profile</h1>

            <ProfileImageUploader
                currentImage={user.image}
                userName={user.name}
            />

            <UserProfileCard user={user} />
        </div>
    );
}
