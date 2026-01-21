import type { PropsWithChildren } from "react";

type Props = {
  minimized?: boolean;
}

export function LeftSidebar({ children, minimized = false }: PropsWithChildren<Props>) {
  return (
    <aside className={`sticky top-0 h-screen transition-all duration-300 ease-in-out ${minimized ? 'w-[3.8rem]' : 'w-[15rem]'}`}>
      {children}
    </aside>
  );
}