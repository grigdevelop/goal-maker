import { Menu } from 'lucide-react';

type Props = {
    minimized?: boolean;
    hidden?: boolean;
    onToggle?: () => void;
}

export function Navbar({ minimized = false, hidden = false, onToggle }: Props) {
    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="flex-none">
                {
                    hidden ? null : (
                        <button className="btn btn-square btn-ghost" onClick={onToggle}>
                            <Menu className="h-5 w-5" />
                        </button>
                    )
                }

                {
                    hidden ? (
                        <label htmlFor="left-sidebar" className="btn btn-square btn-ghost">
                            <Menu className="h-5 w-5" />
                        </label>
                    ) : null
                }
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