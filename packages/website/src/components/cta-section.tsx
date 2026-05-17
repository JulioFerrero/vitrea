import React from "react";
import type { ElementProps } from "@hi/render";

export function CTASection({ element, className, style, attrs }: ElementProps) {
  const headline = (element.data.headline as string) ?? "Ready to build?";
  const description = (element.data.description as string) ?? "";
  const ctaText = (element.data.ctaText as string) ?? "Get Started";
  const ctaHref = (element.data.ctaHref as string) ?? "#";

  return (
    <section
      {...attrs}
      className={`py-24 md:py-36 bg-warm-50 ${className ?? ""}`}
      style={style}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-stone-900" />
          <div
            className="absolute inset-0 pointer-events-none opacity-100"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 30% 50%, rgba(225,29,72,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,251,245,0.03) 0%, transparent 40%)",
            }}
          />
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

          <div className="relative z-10 px-8 sm:px-12 md:px-20 py-20 md:py-28 text-center">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05]">
              {headline}
            </h2>
            {description && (
              <p className="mt-5 text-lg md:text-xl text-stone-400 max-w-lg mx-auto leading-relaxed">
                {description}
              </p>
            )}
            <div className="mt-10">
              <a
                href={ctaHref}
                className="group inline-flex items-center gap-2 bg-white text-stone-900 text-base font-semibold px-10 py-4 rounded-2xl hover:bg-warm-50 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl active:scale-[0.98]"
              >
                {ctaText}
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
