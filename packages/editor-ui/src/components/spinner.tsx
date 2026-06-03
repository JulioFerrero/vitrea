"use client";

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-6 w-6 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
    </div>
  );
}
