import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type CursorMode = "default" | "hover" | "grab" | "grabbing" | "text";

export function CanvasCursor({
  containerRef,
  mode,
  color = "#7B61FF",
  name,
  visible = true,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  mode: CursorMode;
  color?: string;
  name?: string;
  visible?: boolean;
}) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [inContainer, setInContainer] = useState(false);
  const frameRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => setPos({ x: e.clientX, y: e.clientY }));
    };
    const onEnter = () => setInContainer(true);
    const onLeave = () => setInContainer(false);

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frameRef.current);
    };
  }, [containerRef]);

  if (!visible || !inContainer) return null;

  const showLabel = name || mode === "hover" || mode === "grab";
  const labelText = name || (mode === "hover" ? "Select" : mode === "grab" ? "Pan" : null);
  const arrowFill = color;

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: pos.x, top: pos.y }}>

        {(mode === "default" || mode === "hover" || mode === "grab") && (
          <>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ marginTop: -4, marginLeft: -2 }}>
              <defs>
                <filter id="cursor-shadow" x="5.6" y="6.3" width="22" height="23.2" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                  <feOffset dy="1" />
                  <feGaussianBlur stdDeviation="1.5" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                  <feBlend mode="normal" in2="BackgroundImageFix" result="shadow" />
                  <feBlend mode="normal" in="SourceGraphic" in2="shadow" result="shape" />
                </filter>
              </defs>
              <g filter="url(#cursor-shadow)">
                <path fillRule="evenodd" clipRule="evenodd" d="M22 15.5068L10 10L12.8382 23L16.3062 17.8654L22 15.5068Z" fill={arrowFill} />
                <path d="M10.209 9.5459L22.209 15.0527L23.25 15.5303L22.1914 15.9688L16.6367 18.2695L13.2529 23.2803L12.5986 24.248L12.3496 23.1064L9.51172 10.1064L9.29785 9.12793L10.209 9.5459Z" stroke="white" strokeMiterlimit="16" />
              </g>
            </svg>
            {showLabel && labelText && (
              <span style={{
                position: "absolute", top: 20, left: 18,
                background: color, color: "white",
                fontSize: 10, fontWeight: 600, fontFamily: "Inter, system-ui, sans-serif",
                padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap",
                boxShadow: "0 1px 4px rgba(0,0,0,.18)",
              }}>
                {labelText}
              </span>
            )}
          </>
        )}

        {mode === "grabbing" && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginTop: -2, marginLeft: -4 }}>
            <defs>
              <filter id="grab-shadow" x="-4" y="-2" width="32" height="28" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dy="1" />
                <feGaussianBlur stdDeviation="1.5" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="shadow" />
                <feBlend mode="normal" in="SourceGraphic" in2="shadow" result="shape" />
              </filter>
            </defs>
            <g filter="url(#grab-shadow)">
              <path d="M8 13V5.5C8 4.67157 8.67157 4 9.5 4C10.3284 4 11 4.67157 11 5.5V11H12V3.5C12 2.67157 12.6716 2 13.5 2C14.3284 2 15 2.67157 15 3.5V11H16V5C16 4.17157 16.6716 3.5 17.5 3.5C18.3284 3.5 19 4.17157 19 5V13.5C19 17.0899 16.0899 20 12.5 20C9.5 20 7.5 18.5 6 16.5L4.5 14.5C3.9 13.7 4.05 12.6 4.85 12C5.65 11.4 6.8 11.6 7.4 12.4L8 13Z" fill={color} stroke="white" strokeWidth="1" />
            </g>
          </svg>
        )}

        {mode === "text" && (
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none" style={{ marginTop: -2, marginLeft: 2 }}>
            <defs>
              <filter id="text-shadow" x="-4" y="-2" width="20" height="24" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dy="1" />
                <feGaussianBlur stdDeviation="1" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="shadow" />
                <feBlend mode="normal" in="SourceGraphic" in2="shadow" result="shape" />
              </filter>
            </defs>
            <g filter="url(#text-shadow)">
              <path d="M0 1h12M0 19h12M6 1v18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </svg>
        )}

      </div>
    </div>,
    document.body,
  );
}
