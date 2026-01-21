'use client';

import { useState, useEffect, type PropsWithChildren } from "react";
import { LeftMenu, LeftSidebar, TopPanel, Navbar } from "@/components/layouts";
import { useSidebarState } from "@/hooks";

type Props = {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: PropsWithChildren<Props>) {
    const [minimized, toggleMinimized, hidden] = useSidebarState();
    
    return (
        <div className="flex min-h-screen drawer">
            <input id="left-sidebar" type="checkbox" className="drawer-toggle" />
            <LeftSidebar minimized={minimized} hidden={hidden}>
                <LeftMenu minimized={minimized} />
            </LeftSidebar>

            <div className="drawer-side">
                <label htmlFor="left-sidebar" aria-label="close sidebar" className="drawer-overlay"></label>
                <LeftSidebar minimized={false} hidden={false}>
                    <LeftMenu minimized={false} />
                </LeftSidebar>
            </div>

            <main className="flex-1">
                <TopPanel>
                    <Navbar hidden={hidden} minimized={minimized} onToggle={toggleMinimized} />
                </TopPanel>
                <div>
                    {children}
                </div>
            </main>
        </div>
    );
}
