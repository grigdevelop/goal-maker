'use client';

import { useState, type PropsWithChildren } from "react";
import { LeftMenu, LeftSidebar, TopPanel, Navbar } from "@/components/layouts";

type Props = {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: PropsWithChildren<Props>) {
    const [minimized, setMinimized] = useState(false);

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
