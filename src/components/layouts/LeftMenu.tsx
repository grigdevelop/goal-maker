import { Target, Lightbulb, CheckSquare } from 'lucide-react';
import Link from 'next/link';

export function LeftMenu() {
  return (
    <ul data-left-nav-class-minimized="[&_span]:hidden" className={`menu bg-base-200 rounded-box w-full`}>
      <li>
        <Link href="/goals">
          <Target className="h-5 w-5" />
          <span>Goals</span>
        </Link>
      </li>
      <li>
        <Link href="/skills">
          <Lightbulb className="h-5 w-5" />
          <span>Skills</span>
        </Link>
      </li>
      <li>
        <Link href="/tasks">
          <CheckSquare className="h-5 w-5" />
          <span>Tasks</span>
        </Link>
      </li>
    </ul>
  );
}