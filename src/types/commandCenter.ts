export type CommandCenterLinkType = "external" | "internal";

export interface CommandCenterLinkItem {
  id: string;
  title: string;
  description?: string;
  type: CommandCenterLinkType;
  url: string;
  thumbnailUrl?: string;
  tags?: string[];
}

export interface CommandCenterCategory {
  id: string;
  title: string;
  description?: string;
  color?: string;
  items: CommandCenterLinkItem[];
}
