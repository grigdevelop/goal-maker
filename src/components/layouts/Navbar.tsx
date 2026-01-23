import { Menu } from 'lucide-react';

type Props = {
    onToggle?: () => void;
}

export function Navbar({ onToggle }: Props) {
    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="flex-none">
                <button className="btn btn-square btn-ghost hidden md:inline-flex" onClick={onToggle}>
                    <Menu className="h-5 w-5" />
                </button>
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