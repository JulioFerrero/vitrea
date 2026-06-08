import type { CSSProperties } from "react";

const shadowLayers =
  "0px 40px 24px 0px rgba(0,0,0,0.03), 0px 23px 14px 0px rgba(0,0,0,0.04), 0px 10px 10px 0px rgba(0,0,0,0.06), 0px 3px 6px 0px rgba(0,0,0,0.08), 0px 0px 0px 0.75px rgba(0,0,0,0.06), inset 0px -2px 8px 0px rgba(0,0,0,0.02), inset 0px 2px 8px 0px rgba(255,255,255,0.8), inset 0px 0.75px 0.25px 0px rgba(255,255,255,0.6), inset 0px 0.25px 0.25px 0px rgba(255,255,255,0.4)";

export const glassStyle: CSSProperties = {
  background: "rgba(255,255,255,0.72)",
  backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 100%)",
  boxShadow: shadowLayers,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};
