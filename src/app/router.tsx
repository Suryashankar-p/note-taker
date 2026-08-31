import { createBrowserRouter } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { HomePage } from '@/pages/HomePage';
import { NotesPage } from '@/pages/NotesPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <PageWrapper>{children}</PageWrapper>
    </>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <Layout><HomePage /></Layout> },
  { path: '/notes', element: <Layout><NotesPage /></Layout> },
  { path: '*', element: <Layout><NotFoundPage /></Layout> },
]);
