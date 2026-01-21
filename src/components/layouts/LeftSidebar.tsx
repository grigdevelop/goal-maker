import type { PropsWithChildren } from "react";

export function LeftSidebar({ children }: PropsWithChildren) {
  return (
    <aside className="w-[15rem] sticky top-0 h-screen">
      {children}
    </aside>
  );
}