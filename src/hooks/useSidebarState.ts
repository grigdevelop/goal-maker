'use client';

import { useState, useEffect, useMemo } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";

type SidebarState = 'minimized' | 'expanded' | 'hidden';

export function useSidebarState() : [boolean, () => void, boolean] {
    const [minimized, setMinimized] = useState(false);
    const breakpoint = useBreakpoint();

    const toggleMinimized = () => {
        if(breakpoint === 'mobile') return;
        setMinimized(!minimized);
    };

     useEffect(() => {
        if (breakpoint === 'tablet' || breakpoint === 'mobile') {
            setMinimized(true);
        } else {
            setMinimized(false);
        }
    }, [breakpoint]);

    const hidden = useMemo(() => breakpoint === 'mobile', [breakpoint]);
    
    return [minimized, toggleMinimized, hidden];
}