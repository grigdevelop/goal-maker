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
        <>
            <div className="navbar bg-base-100 shadow-[0_6px_12px_4px_rgba(255,255,255,0.8)] dark:shadow-none relative z-10">
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
                            <div className="hidden md:inline-flex">
                                <CreateGoalBtn />
                                <CreateSkillBtn />
                                <CreateTaskBtn />
                            </div>
                        </ul>
                    </div>
                </div>
                <div className='navbar-end'>
                    {userMenu}
                </div>
                <div className="w-full h-[2px] bg-base-300 z-100 absolute bottom-0"></div>
            </div>
        </>
    );
}