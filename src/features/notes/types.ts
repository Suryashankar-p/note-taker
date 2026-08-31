import type { ID } from '@/types';

export interface Note {
  id: ID;
  title: string;
  content: string;
  createdAt: number;
}
