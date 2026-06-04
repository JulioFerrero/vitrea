"use client";

import { useState, createContext, useContext } from "react";
import { TopBar } from "./top-bar/top-bar";
import { LeftPanel } from "./left-panel/left-panel";
import { RightPanel } from "./right-panel/right-panel";
import { Canvas } from "./canvas/canvas";
import { glassStyle } from "@vitrea/editor-ui/glass";

const PanelContext = createContext({
  leftOpen: true,
  rightOpen: true,
  toggleLeft: () => {},
  toggleRight: () => {},
});

export function usePanelState() {
  return useContext(PanelContext);
}

const DotsIcon = () => (
  <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor">
    <circle cx="1.5" cy="2" r="0.9" />
    <circle cx="6.5" cy="2" r="0.9" />
    <circle cx="1.5" cy="6" r="0.9" />
    <circle cx="6.5" cy="6" r="0.9" />
    <circle cx="1.5" cy="10" r="0.9" />
    <circle cx="6.5" cy="10" r="0.9" />
  </svg>
);

export function EditorShell({ children: _children }: { children?: React.ReactNode }) {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const ctx = {
    leftOpen,
    rightOpen,
    toggleLeft: () => setLeftOpen((v) => !v),
    toggleRight: () => setRightOpen((v) => !v),
  };

  return (
    <PanelContext.Provider value={ctx}>
      <div className="relative h-screen overflow-hidden bg-editor-canvas">
        <Canvas leftPanelOpen={leftOpen} rightPanelOpen={rightOpen} />

        <div className="absolute top-3 left-3 right-3 z-50">
          <TopBar />
        </div>

        <div
          className="absolute left-3 top-[70px] bottom-3 z-30 transition-transform duration-200 ease-in-out"
          style={{ transform: leftOpen ? "translateX(0)" : "translateX(-100%)" }}
        >
          <LeftPanel />
        </div>
        <button
          type="button"
          onClick={ctx.toggleLeft}
          className="absolute top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-5 h-20 rounded-r-xl backdrop-blur-[10px] text-white hover:text-white hover:bg-white/10 transition-all duration-200"
          style={{ left: leftOpen ? 252 : 12, ...glassStyle }}
        >
          <DotsIcon />
        </button>
        <div
          className="absolute right-3 top-[70px] bottom-3 z-30 transition-transform duration-200 ease-in-out"
          style={{ transform: rightOpen ? "translateX(0)" : "translateX(100%)" }}
        >
          <RightPanel />
        </div>
        <button
          type="button"
          onClick={ctx.toggleRight}
          className="absolute top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-5 h-20 rounded-l-xl backdrop-blur-[10px] text-white hover:text-white hover:bg-white/10 transition-all duration-200"
          style={{ right: rightOpen ? 252 : 12, ...glassStyle }}
        >
          <DotsIcon />
        </button>
      </div>
    </PanelContext.Provider>
  );
}
