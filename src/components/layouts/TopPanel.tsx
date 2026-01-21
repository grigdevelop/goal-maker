import type { PropsWithChildren } from "react";

export function TopPanel({ children }: PropsWithChildren) {
  return (
    <div className="sticky top-0">
      {children}
    </div>
  );
}