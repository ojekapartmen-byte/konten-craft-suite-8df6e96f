import { create } from "zustand";
import { persist } from "zustand/middleware";
import { commandCenterCategories } from "@/data/commandCenterLinks";
import { CommandCenterCategory, CommandCenterLinkItem, CommandCenterLinkType } from "@/types/commandCenter";

interface CommandCenterState {
  categories: CommandCenterCategory[];
  query: string;
  setQuery: (query: string) => void;
  setCategories: (categories: CommandCenterCategory[]) => void;
  resetToDefault: () => void;
  addCategory: (payload?: Partial<Pick<CommandCenterCategory, "title" | "description" | "color">>) => void;
  updateCategory: (categoryId: string, patch: Partial<Pick<CommandCenterCategory, "title" | "description" | "color">>) => void;
  deleteCategory: (categoryId: string) => void;
  addItem: (categoryId: string, payload?: Partial<Omit<CommandCenterLinkItem, "id">>) => void;
  updateItem: (categoryId: string, itemId: string, patch: Partial<Omit<CommandCenterLinkItem, "id">>) => void;
  deleteItem: (categoryId: string, itemId: string) => void;
}

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const defaultNewItem = (): Omit<CommandCenterLinkItem, "id"> => ({
  title: "Shortcut baru",
  description: "",
  type: "external" satisfies CommandCenterLinkType,
  url: "https://",
  tags: [],
  thumbnailUrl: undefined,
});

export const useCommandCenterStore = create<CommandCenterState>()(
  persist(
    (set, get) => ({
      categories: commandCenterCategories,
      query: "",
      setQuery: (query) => set({ query }),
      setCategories: (categories) => set({ categories }),
      resetToDefault: () => set({ categories: commandCenterCategories }),
      addCategory: (payload) =>
        set((state) => ({
          categories: [
            ...state.categories,
            {
              id: createId(),
              title: payload?.title?.trim() || "Kategori baru",
              description: payload?.description?.trim() || "",
              color: payload?.color,
              items: [],
            },
          ],
        })),
      updateCategory: (categoryId, patch) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === categoryId
              ? {
                  ...c,
                  title: patch.title !== undefined ? patch.title : c.title,
                  description: patch.description !== undefined ? patch.description : c.description,
                  color: patch.color !== undefined ? patch.color : c.color,
                }
              : c
          ),
        })),
      deleteCategory: (categoryId) =>
        set((state) => ({ categories: state.categories.filter((c) => c.id !== categoryId) })),
      addItem: (categoryId, payload) =>
        set((state) => ({
          categories: state.categories.map((c) => {
            if (c.id !== categoryId) return c;
            return {
              ...c,
              items: [
                ...c.items,
                {
                  id: createId(),
                  ...defaultNewItem(),
                  ...payload,
                  title: payload?.title?.trim() || defaultNewItem().title,
                  description: payload?.description?.trim() || defaultNewItem().description,
                  url: payload?.url?.trim() || defaultNewItem().url,
                  tags: payload?.tags ?? defaultNewItem().tags,
                },
              ],
            };
          }),
        })),
      updateItem: (categoryId, itemId, patch) =>
        set((state) => ({
          categories: state.categories.map((c) => {
            if (c.id !== categoryId) return c;
            return {
              ...c,
              items: c.items.map((i) => {
                if (i.id !== itemId) return i;
                return {
                  ...i,
                  title: patch.title !== undefined ? patch.title : i.title,
                  description: patch.description !== undefined ? patch.description : i.description,
                  type: patch.type !== undefined ? patch.type : i.type,
                  url: patch.url !== undefined ? patch.url : i.url,
                  tags: patch.tags !== undefined ? patch.tags : i.tags,
                  thumbnailUrl: patch.thumbnailUrl !== undefined ? patch.thumbnailUrl : i.thumbnailUrl,
                };
              }),
            };
          }),
        })),
      deleteItem: (categoryId, itemId) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === categoryId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
          ),
        })),
    }),
    {
      name: "command-center-store",
      version: 1,
      partialize: (state) => ({ categories: state.categories }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<CommandCenterState>;
        const categories = Array.isArray(persistedState.categories) && persistedState.categories.length > 0
          ? persistedState.categories
          : current.categories;
        return { ...current, ...persistedState, categories };
      },
    }
  )
);
