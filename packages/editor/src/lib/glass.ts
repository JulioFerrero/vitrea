// Shared glassmorphism style definitions — single source of truth
// Used across TopBar, LeftPanel, RightPanel, CanvasToolbar, modals, dropdowns

const shadowLayers = "0px 40px 24px 0px rgba(0,0,0,0.06), 0px 23px 14px 0px rgba(0,0,0,0.08), 0px 10px 10px 0px rgba(0,0,0,0.12), 0px 3px 6px 0px rgba(0,0,0,0.19), 0px 0px 0px 0.75px rgba(0,0,0,0.56), inset 0px -12px 16px 0px rgba(255,255,255,0.06), inset 0px 4px 16px 0px rgba(255,255,255,0.16), inset 0px 0.75px 0.25px 0px rgba(255,255,255,0.12), inset 0px 0.25px 0.25px 0px rgba(255,255,255,0.32)";

export const glassStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.56)",
  backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)",
  boxShadow: shadowLayers,
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

export const glassDarkStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.72)",
  backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)",
  boxShadow: shadowLayers,
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

export const glassPanelClass = "rounded-2xl backdrop-blur-[10px]";

export const overlayStyle: React.CSSProperties = {
  backgroundColor: "rgba(0,0,0,0.55)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};

export const tooltipStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.78)",
  backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)",
  boxShadow: "0px 10px 10px 0px rgba(0,0,0,0.12), 0px 3px 6px 0px rgba(0,0,0,0.19), inset 0px 0.75px 0.25px 0px rgba(255,255,255,0.12)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};
