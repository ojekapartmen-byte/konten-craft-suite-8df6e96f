import { create } from "zustand";
import { commandCenterCategories } from "@/data/commandCenterLinks";
import { CommandCenterCategory } from "@/types/commandCenter";

interface CommandCenterState {
  categories: CommandCenterCategory[];
  query: string;
  setQuery: (query: string) => void;
  setCategories: (categories: CommandCenterCategory[]) => void;
}

export const useCommandCenterStore = create<CommandCenterState>((set) => ({
  categories: commandCenterCategories,
  query: "",
  setQuery: (query) => set({ query }),
  setCategories: (categories) => set({ categories }),
}));

