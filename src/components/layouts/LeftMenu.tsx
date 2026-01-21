import { Target, Lightbulb, CheckSquare } from 'lucide-react';

type Props = {
  minimized?: boolean;
};

export function LeftMenu({ minimized = false }: Props) {
  return (
    <ul className="menu bg-base-200 rounded-box w-full">
      <li>
        <a>
          <Target className="h-5 w-5" />
          {!minimized && 'Goals'}
        </a>
      </li>
      <li>
        <a>
          <Lightbulb className="h-5 w-5" />
          {!minimized && 'Skills'}
        </a>
      </li>
      <li>
        <a>
          <CheckSquare className="h-5 w-5" />
          {!minimized && 'Tasks'}
        </a>
      </li>
    </ul>
  );
}