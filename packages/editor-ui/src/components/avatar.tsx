"use client";

export function Avatar({
  src,
  name,
  className,
  size = 32,
}: {
  src?: string;
  name?: string;
  className?: string;
  size?: number;
}) {
  const initials = (name ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`relative rounded-full overflow-hidden border border-white/[0.06] bg-white/[0.03] flex items-center justify-center shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="text-[11px] font-medium text-white/50">{initials}</span>
      )}
    </div>
  );
}
