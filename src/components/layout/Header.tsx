import { NavLink } from 'react-router-dom';
import { APP_NAME } from '@/lib/constants';

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

export function Header() {
  return (
    <header className="border-b border-slate-200">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <span className="text-lg font-semibold text-slate-900">{APP_NAME}</span>
        <nav className="flex gap-1">
          <NavLink to="/" end className={linkClasses}>
            Home
          </NavLink>
          <NavLink to="/notes" className={linkClasses}>
            Notes
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
