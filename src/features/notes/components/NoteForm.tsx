import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useNotesStore } from '../store';

export function NoteForm() {
  const addNote = useNotesStore((state) => state.addNote);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    addNote(title.trim(), content.trim());
    setTitle('');
    setContent('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Title"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write a note..."
        rows={3}
        className="resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
      <Button type="submit" className="self-end">
        Add note
      </Button>
    </form>
  );
}
