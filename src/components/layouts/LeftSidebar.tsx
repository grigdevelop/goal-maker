import { type PropsWithChildren } from "react";

type Props = {
  minimized?: boolean;
  className?: string;
}

export function LeftSidebar({ children, minimized = false, className = '' }: PropsWithChildren<Props>) {
  return (
    <aside className={`sticky bg-base-200 top-0 h-screen transition-all duration-300 ease-in-out ${minimized ? 'w-[3.8rem]' : 'w-[15rem]'} ${className}`}>
      {children}
    </aside>
  );
}