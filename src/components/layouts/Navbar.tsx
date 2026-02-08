'use client';

import Link from 'next/link';
import { Menu, Plus } from 'lucide-react';
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
            {/* <div className="navbar bg-base-100 shadow-[0_6px_12px_4px_rgba(255,255,255,0.8)] dark:shadow-none relative z-10 ">  */}
            <div className="navbar bg-base-100 relative z-10 ">
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
                        </ul>
                        <div className="dropdown dropdown-center">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                                <Plus />
                            </div>
                            <ul tabIndex={-1} className="menu menu-sm dropdown-content bg-base-100 rounded-box w-26 mt-3 p-2 shadow">
                                <li><CreateGoalBtn /></li>
                                <li><CreateSkillBtn /></li>
                                <li><CreateTaskBtn /></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className='navbar-end'>
                    {userMenu}
                </div>
            </div>
        </>
    );
}