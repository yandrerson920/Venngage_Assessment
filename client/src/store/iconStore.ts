import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Icon } from '../types';

interface IconState {
  icons: Icon[];
  loading: boolean;
  error: string | null;
  metadata: any;
  setIcons: (icons: Icon[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMetadata: (metadata: any) => void;
  reset: () => void;
}

const initialState = {
  icons: [],
  loading: false,
  error: null,
  metadata: null,
};

export const useIconStore = create<IconState>()(
  devtools(
    (set) => ({
      ...initialState,
      setIcons: (icons) => set({ icons }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setMetadata: (metadata) => set({ metadata }),
      reset: () => set(initialState),
    }),
    { name: 'IconStore' }
  )
);
