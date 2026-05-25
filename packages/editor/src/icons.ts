import {
  LayoutDashboard, Rows3, Columns3, Grid3x3, Heading, Type, Image,
  Square, Link, Minus, MoveVertical, Play, Code, Sparkles, Monitor,
  MousePointerClick, LayoutGrid, PanelTop, PanelBottom, Layers,
  LayoutTemplate, SquareMousePointer, RectangleHorizontal, Plus, Globe,
  Trash2, File, Pencil, ChevronRight, ChevronDown, Copy, ArrowUp,
  ArrowDown, Save, Undo2, Redo2, Loader2, Tablet, Smartphone, Check,
  ShoppingBag, Package, FileText, HelpCircle,
} from "lucide-react";
import type { ComponentType } from "react";

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  "layout-dashboard": LayoutDashboard,
  "rows-3": Rows3,
  "columns-3": Columns3,
  "grid-3x3": Grid3x3,
  "heading": Heading,
  "type": Type,
  "image": Image,
  "square": Square,
  "link": Link,
  "minus": Minus,
  "move-vertical": MoveVertical,
  "play": Play,
  "code": Code,
  "sparkles": Sparkles,
  "monitor": Monitor,
  "mouse-pointer-click": MousePointerClick,
  "layout-grid": LayoutGrid,
  "panel-top": PanelTop,
  "panel-bottom": PanelBottom,
  "layers": Layers,
  "layout-template": LayoutTemplate,
  "square-mouse-pointer": SquareMousePointer,
  "rectangle-horizontal": RectangleHorizontal,
  "plus": Plus,
  "globe": Globe,
  "trash-2": Trash2,
  "file": File,
  "pencil": Pencil,
  "chevron-right": ChevronRight,
  "chevron-down": ChevronDown,
  "copy": Copy,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  "save": Save,
  "undo-2": Undo2,
  "redo-2": Redo2,
  "loader-circle": Loader2,
  "tablet-smartphone": Tablet,
  "smartphone": Smartphone,
  "check": Check,
  "shopping-bag": ShoppingBag,
  "package": Package,
  "file-text": FileText,
  "help-circle": HelpCircle,
};

export function getIcon(name: string): ComponentType<{ className?: string }> | null {
  return ICON_MAP[name] ?? null;
}

export function hasIcon(name: string): boolean {
  return name in ICON_MAP;
}
