'use client';

import { useState, useEffect, type PropsWithChildren } from "react";
import { LeftMenu, LeftSidebar, TopPanel, Navbar } from "@/components/layouts";
import { useBreakpoint } from "@/hooks";

type Props = {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: PropsWithChildren<Props>) {
    const breakpoint = useBreakpoint();
    const [minimized, setMinimized] = useState(false);
    
    useEffect(() => {
        if (breakpoint === 'tablet' || breakpoint === 'mobile') {
            setMinimized(true);
        } else {
            setMinimized(false);
        }
    }, [breakpoint]);
    
    return (
        <div className="flex min-h-screen">
            <LeftSidebar minimized={minimized}>
                <LeftMenu minimized={minimized} />
            </LeftSidebar>
            <main className="flex-1">
                <TopPanel>
                    <Navbar minimized={minimized} onToggle={() => setMinimized(!minimized)} />
                </TopPanel>
                <div>
                    {children}
                </div>
            </main>
        </div>
    );
}
