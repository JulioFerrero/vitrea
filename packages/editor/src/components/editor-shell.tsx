"use client";

import { useState, createContext, useContext, useRef } from "react";
import { TopBar } from "./top-bar/top-bar";
import { LeftPanel } from "./left-panel/left-panel";
import { RightPanel } from "./right-panel/right-panel";
import { Canvas } from "./canvas/canvas";

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
  const [leftHover, setLeftHover] = useState(false);
  const [rightHover, setRightHover] = useState(false);

  const ctx = {
    leftOpen,
    rightOpen,
    toggleLeft: () => setLeftOpen((v) => !v),
    toggleRight: () => setRightOpen((v) => !v),
  };

  return (
    <PanelContext.Provider value={ctx}>
      <div className="flex h-screen flex-col bg-background">
        <TopBar />
        <div className="relative flex-1 overflow-hidden"
          onMouseMove={(e) => {
            const w = e.currentTarget.clientWidth;
            setLeftHover(e.clientX < 260);
            setRightHover(e.clientX > w - 260);
          }}
          onMouseLeave={() => {
            setLeftHover(false);
            setRightHover(false);
          }}
        >
          <Canvas leftPanelOpen={leftOpen} rightPanelOpen={rightOpen} />
          <div
            className="absolute left-0 top-0 bottom-0 z-30 transition-transform duration-200 ease-in-out"
            style={{ transform: leftOpen ? "translateX(0)" : "translateX(-100%)" }}
          >
            <LeftPanel />
          </div>
          <button
            type="button"
            onClick={ctx.toggleLeft}
            className="absolute top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-4 h-16 rounded-r-md bg-black/80 backdrop-blur-xl text-white/30 hover:text-white/60 hover:bg-black/90 transition-all duration-200"
            style={{
              left: leftOpen ? 240 : 0,
              opacity: leftHover || !leftOpen ? 1 : 0,
              pointerEvents: leftHover || !leftOpen ? "auto" : "none",
            }}
          >
            <DotsIcon />
          </button>
          <div
            className="absolute right-0 top-0 bottom-0 z-30 transition-transform duration-200 ease-in-out"
            style={{ transform: rightOpen ? "translateX(0)" : "translateX(100%)" }}
          >
            <RightPanel />
          </div>
          <button
            type="button"
            onClick={ctx.toggleRight}
            className="absolute top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-4 h-16 rounded-l-md bg-black/80 backdrop-blur-xl text-white/30 hover:text-white/60 hover:bg-black/90 transition-all duration-200"
            style={{
              right: rightOpen ? 240 : 0,
              opacity: rightHover || !rightOpen ? 1 : 0,
              pointerEvents: rightHover || !rightOpen ? "auto" : "none",
            }}
          >
            <DotsIcon />
          </button>
        </div>
      </div>
    </PanelContext.Provider>
  );
}
