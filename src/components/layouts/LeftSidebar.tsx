import { type PropsWithChildren } from "react";

type Props = {
  minimized?: boolean;
  hidden?: boolean;
}

export function LeftSidebar({ children, minimized = false, hidden }: PropsWithChildren<Props>) {
  return (
    <>
      {
        hidden ? null : (
          <aside className={`sticky bg-base-200 top-0 h-screen transition-all duration-300 ease-in-out ${minimized ? 'w-[3.8rem]' : 'w-[15rem]'}`}>
            {children}
          </aside>
        )
      }
    </>
  );
}