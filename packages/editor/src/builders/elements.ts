import type { ElementTypeConfig, FieldConfig } from "../types";

type BaseConfig = {
  type: string;
  label: string;
  icon: string;
  defaultStyles?: Record<string, string>;
  defaultData?: Record<string, unknown>;
  fields?: FieldConfig[];
};

const CONTAINER_GROUPS = ["spacing", "sizing", "layout", "background", "border", "effects"];
const TEXT_GROUPS = ["spacing", "sizing", "typography", "background", "border", "effects"];
const MEDIA_GROUPS = ["spacing", "sizing", "effects"];
const ACTION_GROUPS = ["spacing", "sizing", "typography", "background", "border", "effects"];
const UTILITY_GROUPS = ["spacing", "sizing"];

export function defineContainer(config: BaseConfig): ElementTypeConfig {
  return {
    category: "layout",
    isContainer: true,
    defaultStyles: {},
    defaultData: {},
    fields: [],
    styleGroups: CONTAINER_GROUPS,
    ...config,
  };
}

export function defineText(config: BaseConfig): ElementTypeConfig {
  return {
    category: "content",
    isContainer: false,
    defaultStyles: {},
    defaultData: {},
    fields: [],
    styleGroups: TEXT_GROUPS,
    ...config,
  };
}

export function defineMedia(config: BaseConfig): ElementTypeConfig {
  return {
    category: "content",
    isContainer: false,
    defaultStyles: {},
    defaultData: {},
    fields: [],
    styleGroups: MEDIA_GROUPS,
    ...config,
  };
}

export function defineAction(config: BaseConfig): ElementTypeConfig {
  return {
    category: "content",
    isContainer: false,
    defaultStyles: {},
    defaultData: {},
    fields: [],
    styleGroups: ACTION_GROUPS,
    ...config,
  };
}

export function defineUtility(config: BaseConfig): ElementTypeConfig {
  return {
    category: "content",
    isContainer: false,
    defaultStyles: {},
    defaultData: {},
    fields: [],
    styleGroups: UTILITY_GROUPS,
    ...config,
  };
}

export function defineElement(config: ElementTypeConfig): ElementTypeConfig {
  return config;
}
