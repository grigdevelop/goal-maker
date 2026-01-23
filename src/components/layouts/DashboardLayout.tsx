'use client';

import { type PropsWithChildren, useRef } from "react";
import { LeftMenu, LeftSidebar, TopPanel, Navbar } from "@/components/layouts";

type Props = {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: PropsWithChildren<Props>) {
    const leftMenuRef = useRef<HTMLDivElement>(null);

    return (
        <div className="flex min-h-screen drawer" ref={leftMenuRef}>
            <input id="left-sidebar" type="checkbox" className="drawer-toggle" />
            <LeftSidebar className="hidden md:block">
                <LeftMenu/>
            </LeftSidebar>

            <div className="drawer-side">
                <label htmlFor="left-sidebar" aria-label="close sidebar" className="drawer-overlay"></label>
                <LeftSidebar>
                    <LeftMenu/>
                </LeftSidebar>
            </div>

            <main className="flex-1">
                <TopPanel>
                    <Navbar rootEl={leftMenuRef}/>
                </TopPanel>
                <div>
                    {children}
                </div>
            </main>
        </div>
    );
}
