import { describe, it, expect } from "vitest";
import { filterCommandCenterCategories } from "@/utils/commandCenterSearch";
import { CommandCenterCategory } from "@/types/commandCenter";

const sample: CommandCenterCategory[] = [
  {
    id: "a",
    title: "Deploy",
    items: [
      { id: "vercel", title: "Vercel", type: "external", url: "https://vercel.com", tags: ["deploy"] },
      { id: "netlify", title: "Netlify", type: "external", url: "https://netlify.com" },
    ],
  },
  {
    id: "b",
    title: "Analytics",
    items: [
      { id: "ga", title: "Google Analytics", description: "traffic", type: "external", url: "https://analytics.google.com" },
    ],
  },
];

describe("filterCommandCenterCategories", () => {
  it("returns all categories when query empty", () => {
    expect(filterCommandCenterCategories(sample, "")).toEqual(sample);
  });

  it("filters by title", () => {
    const out = filterCommandCenterCategories(sample, "vercel");
    expect(out).toHaveLength(1);
    expect(out[0]?.items).toHaveLength(1);
    expect(out[0]?.items[0]?.id).toBe("vercel");
  });

  it("filters by tags", () => {
    const out = filterCommandCenterCategories(sample, "deploy");
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe("a");
    expect(out[0]?.items.map((i) => i.id)).toEqual(["vercel", "netlify"]);
  });

  it("requires all tokens to match", () => {
    const out = filterCommandCenterCategories(sample, "google deploy");
    expect(out).toHaveLength(0);
  });
});
