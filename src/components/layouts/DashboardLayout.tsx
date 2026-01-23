'use client';

import { type PropsWithChildren, Activity } from "react";
import { LeftMenu, LeftSidebar, TopPanel, Navbar } from "@/components/layouts";
import { useSidebarState } from "@/hooks";

type Props = {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: PropsWithChildren<Props>) {
    const [minimized, toggleMinimized] = useSidebarState();
    
    return (
        <div className="flex min-h-screen drawer">
            <input id="left-sidebar" type="checkbox" className="drawer-toggle" />
            <LeftSidebar minimized={minimized} className="hidden md:block">
                <LeftMenu minimized={minimized} />
            </LeftSidebar>

            <div className="drawer-side">
                <label htmlFor="left-sidebar" aria-label="close sidebar" className="drawer-overlay"></label>
                <LeftSidebar minimized={false}>
                    <LeftMenu minimized={false} />
                </LeftSidebar>
            </div>

            <main className="flex-1">
                <TopPanel>
                    <Navbar onToggle={toggleMinimized} />
                </TopPanel>
                <div>
                    {children}
                </div>
            </main>
        </div>
    );
}
