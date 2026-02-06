'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { User } from 'better-auth';
import { signOutAction } from '@/lib/actions/auth';

type Props = {
    user: User;
}

function getInitialTheme(): 'dark' | 'light' {
    if (typeof window !== 'undefined') {
        return (localStorage.getItem('theme') as 'dark' | 'light') ?? 'dark';
    }
    return 'dark';
}

export function UserMenu({ user }: Props) {
    const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('theme', next);
    };

    const handleLogout = () => {
        signOutAction();
    };

    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                    <Image
                        alt="User avatar"
                        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        width={40}
                        height={40} />
                </div>
            </div>
            <ul
                tabIndex={-1}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                <li className="menu-title">
                    <span>{user.name || user.email}</span>
                </li>
                <li>
                    <a className="justify-between">
                        Profile
                        <span className="badge">New</span>
                    </a>
                </li>
                <li>
                    <button onClick={toggleTheme} className="justify-between">
                        Theme
                        <span className="badge badge-sm">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                    </button>
                </li>
                <li><a>Settings</a></li>
                <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
        </div>
    );
};