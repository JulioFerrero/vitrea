import React from "react";
import type { ElementProps } from "../lib/types";

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
      className={`min-h-[100dvh] relative overflow-hidden bg-warm-50 ${className ?? ""}`}
      style={style}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-[0.03]" style={{ background: "radial-gradient(ellipse, #e11d48 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-[0.02]" style={{ background: "radial-gradient(circle, #e11d48 0%, transparent 60%)" }} />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-32 pb-24 w-full min-h-[100dvh] flex items-center">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-6 items-center w-full">
          <div className="lg:col-span-7 relative z-10">
            {badge && (
              <div className="inline-flex items-center gap-2 bg-white text-stone-600 text-xs font-medium px-4 py-2 rounded-full mb-8 border border-stone-200/80 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-cherry-500 animate-pulse" />
                {badge}
              </div>
            )}

            <h1 className="font-display text-[clamp(2.75rem,7vw,6.5rem)] font-bold text-stone-900 leading-[0.95] tracking-tight">
              {lines.map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {i === lines.length - 1 ? (
                    <span className="text-cherry-600">{line}</span>
                  ) : (
                    line
                  )}
                </React.Fragment>
              ))}
            </h1>

            {subheadline && (
              <p className="mt-8 text-lg md:text-xl text-stone-400 max-w-lg leading-relaxed">
                {subheadline}
              </p>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href={ctaHref}
                className="group relative bg-cherry-600 text-white text-base font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-cherry-700 hover:shadow-xl hover:shadow-cherry-600/15 active:scale-[0.98] overflow-hidden"
              >
                <span className="relative z-10">{ctaText}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cherry-500 to-cherry-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
              {secondaryCtaText && (
                <a
                  href={secondaryCtaHref}
                  className="text-stone-600 text-base font-medium px-8 py-4 rounded-2xl border border-stone-200 hover:border-stone-400 hover:bg-white transition-all duration-300"
                >
                  {secondaryCtaText}
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-stone-200/60 bg-white shadow-2xl shadow-stone-900/5">
              <div className="flex items-center gap-1.5 px-5 py-3.5 bg-stone-50 border-b border-stone-100">
                <span className="w-3 h-3 rounded-full bg-stone-200" />
                <span className="w-3 h-3 rounded-full bg-stone-200" />
                <span className="w-3 h-3 rounded-full bg-stone-200" />
                <span className="ml-4 text-xs text-stone-400 font-mono">hi-editor.app</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[0.7, 1, 0.5].map((h, i) => (
                    <div key={i} className="rounded-xl bg-cherry-50/60 border border-cherry-100/40" style={{ height: `${h * 80}px` }} />
                  ))}
                </div>
                <div className="space-y-2.5">
                  <div className="h-3 bg-stone-100 rounded-full w-3/4" />
                  <div className="h-3 bg-stone-100 rounded-full w-1/2" />
                  <div className="h-3 bg-cherry-50 rounded-full w-2/3 border border-cherry-100/40" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="h-24 rounded-xl bg-warm-100/60 border border-warm-200/40" />
                  <div className="h-24 rounded-xl bg-stone-50 border border-stone-100" />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl bg-cherry-50 border border-cherry-100/60 flex items-center justify-center -z-10">
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-cherry-600">12</div>
                <div className="text-[10px] text-cherry-400 font-medium uppercase tracking-wider">Elements</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
    </section>
  );
}
