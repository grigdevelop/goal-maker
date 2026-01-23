import { type PropsWithChildren } from "react";

type Props = {
  className?: string;
}

export function LeftSidebar({ children, className = '' }: PropsWithChildren<Props>) {
  return (
    <aside data-left-nav-class="w-[15rem]" data-left-nav-class-minimized="w-[3.8rem]" className={`sticky bg-base-200 top-0 h-screen transition-all duration-300 ease-in-out ${className}`}>
      {children}
    </aside>
  );
}