import { LeftMenu, LeftSidebar, TopPanel } from "@/components/layouts";
import { Content } from "./content";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <LeftSidebar>
        <LeftMenu />
      </LeftSidebar>
      <main className="flex-1">
        <TopPanel>
          <div className="navbar bg-base-100 shadow-sm">
            <a className="btn btn-ghost text-xl">daisyUI</a>
          </div>
        </TopPanel>
        <div>
          <Content />
        </div>
      </main>
    </div>
  );
}
