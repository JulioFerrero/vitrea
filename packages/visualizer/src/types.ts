import type { ComponentType } from "react";

export type VisualizerEntry = {
  type: string;
  label: string;
  icon: string;
  category: string;
  fields: { name: string; label: string; type: string }[];
  defaultData: Record<string, unknown>;
  defaultStyles: Record<string, string>;
  Component: ComponentType<Record<string, unknown>>;
};

export type VisualizerConfig = {
  name?: string;
  entries: VisualizerEntry[];
};
