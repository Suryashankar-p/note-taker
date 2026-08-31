import { createBrowserRouter } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { HomePage } from '@/pages/DashBoard';
import { NotesPage } from '@/pages/NotesPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <Layout><HomePage /></Layout> },
  { path: '/notes', element: <Layout><NotesPage /></Layout> },
  { path: '*', element: <Layout><NotFoundPage /></Layout> },
]);
