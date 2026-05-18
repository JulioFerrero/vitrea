"use client";

import { TopBar } from "./top-bar/top-bar";
import { LeftPanel } from "./left-panel/left-panel";
import { RightPanel } from "./right-panel/right-panel";
import { Canvas } from "./canvas/canvas";

export function EditorShell({ children: _children }: { children?: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-background">
      <TopBar />
      <div className="relative flex-1 overflow-hidden">
        <Canvas />
        <div className="absolute left-0 top-0 bottom-0 z-30">
          <LeftPanel />
        </div>
        <div className="absolute right-0 top-0 bottom-0 z-30">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
