import { create } from 'zustand';

export const useGridStore = create((set) => ({
  selectedTransformerId: 'T5',
  tableFilters: {
    search: '',
    status: 'ALL',
  },
  setSelectedTransformerId: (id) => set({ selectedTransformerId: id }),
  setTableFilters: (filters) => set((state) => ({ tableFilters: { ...state.tableFilters, ...filters } })),
}));
