import { Menu } from 'lucide-react';
import { NavbarToggleBtn } from './NavbarToggleBtn';

type Props = {
    rootEl: React.RefObject<HTMLDivElement | null>;
}

export function Navbar({ rootEl }: Props) {
    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="flex-none">
                <NavbarToggleBtn rootEl={rootEl} />
                <label htmlFor="left-sidebar" className="btn btn-square btn-ghost inline-flex md:hidden">
                    <Menu className="h-5 w-5" />
                </label>
            </div>
            <div className="flex-1">
                <ul className="menu menu-horizontal px-1">
                    <li><a>Home</a></li>
                    <li><a>Contacts</a></li>
                </ul>
            </div>
        </div>
    );
}