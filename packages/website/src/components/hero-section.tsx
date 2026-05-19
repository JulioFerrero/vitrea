import React from "react";
import type { ElementProps } from "@hi/render";

export function HeroSection({ element, className, style, attrs }: ElementProps) {
  const headline = (element.data.headline as string) ?? "Build pages\nvisually.";
  const subheadline = (element.data.subheadline as string) ?? "";
  const ctaText = (element.data.ctaText as string) ?? "Get Started";
  const ctaHref = (element.data.ctaHref as string) ?? "#";
  const secondaryCtaText = element.data.secondaryCtaText as string | undefined;
  const secondaryCtaHref = (element.data.secondaryCtaHref as string) ?? "#";
  const badge = element.data.badge as string | undefined;

  const lines = headline.split("\n");

  return (
    <section
      {...attrs}
      className={`min-h-[100dvh] relative overflow-hidden bg-dark-950 ${className ?? ""}`}
      style={style}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[900px] h-[600px] opacity-[0.07]" style={{ background: "radial-gradient(ellipse, #e11d48 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-[0.04]" style={{ background: "radial-gradient(circle, #e11d48 0%, transparent 60%)" }} />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='1' cy='1' r='0.5'/%3E%3C/g%3E%3C/svg%3E\")" }} />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-32 pb-24 w-full min-h-[100dvh] flex items-center relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          <div className="lg:col-span-6 xl:col-span-7">
            {badge && (
              <div className="inline-flex items-center gap-2.5 bg-white/[0.05] text-dark-300 text-xs font-medium px-4 py-2 rounded-full mb-8 border border-white/[0.08]">
                <span className="w-1.5 h-1.5 rounded-full bg-cherry-500 animate-pulse" />
                {badge}
              </div>
            )}

            <h1 className="font-display text-[clamp(2.75rem,6.5vw,6rem)] font-bold text-white leading-[0.95] tracking-tight">
              {lines.map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {i === lines.length - 1 ? (
                    <span className="text-cherry-500">{line}</span>
                  ) : (
                    line
                  )}
                </React.Fragment>
              ))}
            </h1>

            {subheadline && (
              <p className="mt-8 text-lg md:text-xl text-dark-400 max-w-lg leading-relaxed">
                {subheadline}
              </p>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href={ctaHref}
                className="group relative bg-cherry-600 text-white text-base font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-cherry-500 hover:shadow-xl hover:shadow-cherry-600/20 active:scale-[0.98] overflow-hidden"
              >
                <span className="relative z-10">{ctaText}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cherry-500 to-cherry-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
              {secondaryCtaText && (
                <a
                  href={secondaryCtaHref}
                  className="text-dark-300 text-base font-medium px-8 py-4 rounded-2xl border border-white/[0.08] hover:border-white/[0.15] hover:text-white hover:bg-white/[0.03] transition-all duration-300"
                >
                  {secondaryCtaText}
                </a>
              )}
            </div>

            <div className="mt-14 flex items-center gap-8 text-sm text-dark-500">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-cherry-500">
                  <path d="M6 12l-4-4 1.5-1.5L6 9l6.5-6.5L14 4l-8 8z" fill="currentColor"/>
                </svg>
                <span>Open Source</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-cherry-500">
                  <path d="M6 12l-4-4 1.5-1.5L6 9l6.5-6.5L14 4l-8 8z" fill="currentColor"/>
                </svg>
                <span>Self-hosted</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-cherry-500">
                  <path d="M6 12l-4-4 1.5-1.5L6 9l6.5-6.5L14 4l-8 8z" fill="currentColor"/>
                </svg>
                <span>PostgreSQL</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 xl:col-span-5 relative">
            <div className="absolute -inset-8 bg-cherry-600/[0.07] rounded-3xl blur-3xl" />
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-dark-900 shadow-2xl shadow-black/40">
              <div className="flex items-center gap-1.5 px-5 py-3.5 bg-dark-900 border-b border-white/[0.06]">
                <span className="w-3 h-3 rounded-full bg-dark-700" />
                <span className="w-3 h-3 rounded-full bg-dark-700" />
                <span className="w-3 h-3 rounded-full bg-dark-700" />
                <span className="ml-4 text-xs text-dark-500 font-mono">hi-editor.app</span>
              </div>
              <div className="p-6 space-y-4 bg-dark-950">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-cherry-950/40 border border-cherry-900/30 h-14" />
                  <div className="rounded-xl bg-cherry-950/40 border border-cherry-900/30 h-20" />
                  <div className="rounded-xl bg-cherry-950/40 border border-cherry-900/30 h-10" />
                </div>
                <div className="space-y-2.5">
                  <div className="h-3 bg-dark-800 rounded-full w-3/4" />
                  <div className="h-3 bg-dark-800 rounded-full w-1/2" />
                  <div className="h-3 bg-cherry-950/50 rounded-full w-2/3 border border-cherry-900/20" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="h-24 rounded-xl bg-dark-800/80 border border-white/[0.04]" />
                  <div className="h-24 rounded-xl bg-dark-800/80 border border-white/[0.04]" />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 w-36 h-28 rounded-2xl bg-dark-900 border border-white/[0.06] flex items-center justify-center shadow-xl shadow-black/30">
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-cherry-500">100%</div>
                <div className="text-[10px] text-dark-400 font-medium uppercase tracking-wider mt-0.5">Open Source</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  );
}
