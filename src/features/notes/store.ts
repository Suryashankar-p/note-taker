import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note } from './types';

interface NotesState {
  notes: Note[];
  addNote: (title: string, content: string) => void;
  deleteNote: (id: string) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (title, content) =>
        set((state) => ({
          notes: [
            { id: crypto.randomUUID(), title, content, createdAt: Date.now() },
            ...state.notes,
          ],
        })),
      deleteNote: (id) =>
        set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),
    }),
    { name: 'notes-storage' },
  ),
);
