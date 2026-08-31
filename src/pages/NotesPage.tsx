import { NoteForm, NoteList } from '@/features/notes';

export function NotesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-900">Notes</h1>
      <NoteForm />
      <NoteList />
    </div>
  );
}
