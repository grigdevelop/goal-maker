'use client';

import { Breakpoint, useBreakpoint } from "@/hooks";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { removeAttributeClass, addAttributeClass } from "@/lib/tagUtils";

type Props = {
    rootEl: React.RefObject<HTMLDivElement | null>;
}

export function NavbarToggleBtn({ rootEl }: Props) {
    const breakpoint = useBreakpoint();
    const [minimized, setMinimized] = useState(false);


    const handleToggle = () => {
        setMinimized(!minimized);
    }

    useEffect(() => {
        if (breakpoint === 'tablet') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMinimized(true);
        } else {
            setMinimized(false);
        }
    }, [breakpoint]);

    useEffect(() => {
        if (!rootEl.current) return;

        switch (minimized) {
            case true:
                removeAttributeClass(rootEl.current, 'data-left-nav-class');
                addAttributeClass(rootEl.current, 'data-left-nav-class-minimized');
                break;
            case false:
                removeAttributeClass(rootEl.current, 'data-left-nav-class-minimized');
                addAttributeClass(rootEl.current, 'data-left-nav-class');
                break;
        }
    }, [minimized, rootEl]);

    return (
        <button className="btn btn-square btn-ghost hidden md:inline-flex" onClick={handleToggle}>
            <Menu className="h-5 w-5" />
        </button>
    );
}