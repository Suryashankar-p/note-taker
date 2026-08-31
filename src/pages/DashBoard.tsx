import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { APP_NAME } from '@/lib/constants';

export function HomePage() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">Welcome to {APP_NAME}</h1>
      <p className="max-w-md text-slate-600">A simple, feature-based React starter project.</p>
      <Link to="/notes">
        <Button>Go to notes</Button>
      </Link>
    </div>
  );
}
