'use client';

import { useState, useEffect } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";

type SidebarState = 'minimized' | 'expanded' | 'hidden';

export function useSidebarState() : [boolean, () => void] {
    const [minimized, setMinimized] = useState(false);
    const breakpoint = useBreakpoint();

    const toggleMinimized = () => {
        if(breakpoint === 'mobile') return;
        setMinimized(!minimized);
    };

     useEffect(() => {
        if (breakpoint === 'tablet' || breakpoint === 'mobile') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMinimized(true);
        } else if (breakpoint === 'desktop') {
            setMinimized(false);
        }
        
    }, [breakpoint]);
    
    return [minimized, toggleMinimized];
}