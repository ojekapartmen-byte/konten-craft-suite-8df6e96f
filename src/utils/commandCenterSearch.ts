import { CommandCenterCategory, CommandCenterLinkItem } from "@/types/commandCenter";

const normalize = (value: string) => value.trim().toLowerCase();

const splitTokens = (query: string) =>
  normalize(query)
    .split(/\s+/g)
    .filter(Boolean);

const stringifyItem = (category: CommandCenterCategory, item: CommandCenterLinkItem) => {
  const tags = item.tags?.join(" ") ?? "";
  return normalize([category.title, category.description ?? "", item.title, item.description ?? "", item.url, tags].join(" "));
};

export const filterCommandCenterCategories = (categories: CommandCenterCategory[], query: string) => {
  const tokens = splitTokens(query);
  if (tokens.length === 0) return categories;

  return categories
    .map((category) => {
      const items = category.items.filter((item) => {
        const haystack = stringifyItem(category, item);
        return tokens.every((t) => haystack.includes(t));
      });
      return { ...category, items };
    })
    .filter((category) => category.items.length > 0);
};

export const countCommandCenterItems = (categories: CommandCenterCategory[]) =>
  categories.reduce((acc, c) => acc + c.items.length, 0);

