import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect, useState } from 'react';

export interface IngestedFile {
  fileId: string;
  fileName: string;
  ingestedAt: string;
  fileSize?: number;
}

interface LargeFileState {
  chatId: string | null;
  ingestedFiles: IngestedFile[];
  largeFileToggleOn: boolean;
  setChatId: (chatId: string | null) => void;
  setIngestedFiles: (files: IngestedFile[]) => void;
  addIngestedFile: (file: IngestedFile) => void;
  setToggle: (isOn: boolean) => void;
  mergeIngestedFiles: (files: IngestedFile[]) => void;
  resetStore: () => void;
}

export const useLargeFileStore = create<LargeFileState>()(
  persist(
    (set) => ({
      chatId: null,
      ingestedFiles: [],
      largeFileToggleOn: false,
      setChatId: (chatId) => set((state) => {
        if (state.chatId !== null && state.chatId !== chatId) {
          return { chatId, ingestedFiles: [], largeFileToggleOn: false };
        }
        return { chatId };
      }),
      setIngestedFiles: (files) => set({ ingestedFiles: files }),
      addIngestedFile: (file) => set((state) => ({ 
        ingestedFiles: [file, ...state.ingestedFiles],
        largeFileToggleOn: true
      })),
      setToggle: (isOn) => set({ largeFileToggleOn: isOn }),
      mergeIngestedFiles: (files) => set((state) => {
        const existingMap = new Map(state.ingestedFiles.map(f => [f.fileId, f]));
        files.forEach(f => existingMap.set(f.fileId, f));
        const merged = Array.from(existingMap.values());
        merged.sort((a, b) => new Date(b.ingestedAt).getTime() - new Date(a.ingestedAt).getTime());
        return { 
          ingestedFiles: merged,
          largeFileToggleOn: merged.length > 0 ? (state.ingestedFiles.length === 0 && files.length > 0 ? true : state.largeFileToggleOn) : false
        };
      }),
      resetStore: () => set({ ingestedFiles: [], largeFileToggleOn: false, chatId: null }),
    }),
    {
      name: 'thermax-large-file-store',
    }
  )
);

/**
 * Hook that returns true only after the persist middleware has finished
 * rehydrating from localStorage. Use this to guard effects that depend
 * on persisted state to avoid race conditions with default values.
 */
export const useLargeFileStoreHydrated = () => {
  const [hydrated, setHydrated] = useState(
    useLargeFileStore.persist.hasHydrated()
  );

  useEffect(() => {
    const unsub = useLargeFileStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsub;
  }, []);

  return hydrated;
};
