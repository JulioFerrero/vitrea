import type { ElementProps } from "@vitrea/render";

export function CTASection({ element, className, style, attrs }: ElementProps) {
  const isLight = element.data.theme === "light";
  const headline = (element.data.headline as string) ?? "Ready to build?";
  const description = (element.data.description as string) ?? "";
  const ctaText = (element.data.ctaText as string) ?? "Get Started";
  const ctaHref = (element.data.ctaHref as string) ?? "#";

  const bg = isLight ? "bg-stone-50" : "bg-dark-950";
  const cardBg = isLight ? "bg-white" : "bg-dark-900";
  const headingColor = isLight ? "text-stone-900" : "text-white";
  const bodyColor = isLight ? "text-stone-500" : "text-dark-400";
  const btnBg = isLight ? "bg-stone-900 text-white hover:bg-stone-800" : "bg-cherry-600 text-white hover:bg-cherry-500";

  return (
    <section {...attrs} className={`py-24 md:py-36 ${bg} ${className ?? ""}`} style={style}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className={`relative rounded-3xl overflow-hidden ${cardBg} ${isLight ? "border border-stone-200" : ""}`}>
          <div className="relative z-10 px-8 sm:px-12 md:px-20 py-20 md:py-28 text-center">
            <h2 className={`font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] ${headingColor}`}>
              {headline}
            </h2>
            {description && <p className={`mt-5 text-lg md:text-xl max-w-lg mx-auto leading-relaxed ${bodyColor}`}>{description}</p>}
            <div className="mt-10">
              <a href={ctaHref} className={`group inline-flex items-center gap-2 text-base font-semibold px-10 py-4 rounded-2xl transition-all duration-300 active:scale-[0.98] ${btnBg}`}>
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
