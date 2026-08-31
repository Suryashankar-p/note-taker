import { Button } from '@/components/ui/Button';
import { useNotesStore } from '../store';

export function NoteList() {
  const notes = useNotesStore((state) => state.notes);
  const deleteNote = useNotesStore((state) => state.deleteNote);

  if (notes.length === 0) {
    return <p className="text-sm text-slate-500">No notes yet — add your first one above.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {notes.map((note) => (
        <li key={note.id} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-slate-900">{note.title}</h3>
            <Button variant="ghost" onClick={() => deleteNote(note.id)}>
              Delete
            </Button>
          </div>
          {note.content && <p className="mt-1 text-sm text-slate-600">{note.content}</p>}
        </li>
      ))}
    </ul>
  );
}
