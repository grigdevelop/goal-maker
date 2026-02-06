'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { NavbarToggleBtn } from './NavbarToggleBtn';
import { CreateGoalBtn } from '../goals/CreateGoalBtn';
import { CreateSkillBtn } from '../skills/CreateSkillBtn';
import { CreateTaskBtn } from '../tasks/CreateTaskBtn';

type Props = {
    rootEl: React.RefObject<HTMLDivElement | null>;
    userMenu?: React.ReactNode;
}

export function Navbar({ rootEl, userMenu }: Props) {
    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className='navbar-start'>
                <div className="flex-none">
                    <NavbarToggleBtn rootEl={rootEl} />
                    <label htmlFor="left-sidebar" className="btn btn-square btn-ghost inline-flex md:hidden">
                        <Menu className="h-5 w-5" />
                    </label>
                </div>
                <div className="flex-1">
                    <ul className="menu menu-horizontal px-1">
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/contacts">Contacts</Link></li>
                        <CreateGoalBtn />
                        <CreateSkillBtn />
                        <CreateTaskBtn />
                    </ul>
                </div>
            </div>
            <div className='navbar-end'>
                {userMenu}
            </div>
        </div>
    );
}