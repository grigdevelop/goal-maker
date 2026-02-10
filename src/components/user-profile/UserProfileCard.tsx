'use client';

import { Mail, User as UserIcon } from 'lucide-react';
import type { User } from 'better-auth';

type Props = {
    user: User;
};

export function UserProfileCard({ user }: Props) {
    return (
        <div className="card bg-base-200 shadow-md">
            <div className="card-body">
                <h2 className="card-title text-lg">
                    <UserIcon className="h-5 w-5" />
                    Profile Details
                </h2>
                <div className="divider my-1"></div>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <UserIcon className="h-4 w-4 opacity-50 shrink-0" />
                        <div>
                            <p className="text-xs opacity-50">Name</p>
                            <p className="font-medium">{user.name || '—'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 opacity-50 shrink-0" />
                        <div>
                            <p className="text-xs opacity-50">Email</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
