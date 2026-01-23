import { Target, Lightbulb, CheckSquare } from 'lucide-react';

export function LeftMenu() {
  return (
    <ul data-left-nav-class-minimized="[&_span]:hidden" className={`menu bg-base-200 rounded-box w-full`}>
      <li>
        <a>
          <Target className="h-5 w-5" />
          <span>Goals</span>
        </a>
      </li>
      <li>
        <a>
          <Lightbulb className="h-5 w-5" />
          <span>Skills</span>
        </a>
      </li>
      <li>
        <a>
          <CheckSquare className="h-5 w-5" />
          <span>Tasks</span>
        </a>
      </li>
    </ul>
  );
}