import type { ElementProps } from "@vitrea/render";

export function ShowcaseSection({ element, className, style, attrs }: ElementProps) {
  const isLight = element.data.theme === "light";
  const headline = (element.data.headline as string) ?? "Design with precision";
  const description = (element.data.description as string) ?? "";
  const ctaText = element.data.ctaText as string | undefined;
  const ctaHref = (element.data.ctaHref as string) ?? "#";
  const imageSrc = (element.data.imageSrc as string) ?? "https://placehold.co/800x500/171717/525252?text=Hi+Editor";
  const imageAlt = (element.data.imageAlt as string) ?? "Showcase";
  const variant = (element.data.variant as string) ?? "image-right";
  const isReversed = variant === "image-left";

  const bg = isLight ? "bg-white" : "bg-dark-950";
  const border = isLight ? "border-stone-200/80" : "border-white/[0.04]";
  const accent = isLight ? "bg-stone-300" : "bg-cherry-600";
  const headingColor = isLight ? "text-stone-900" : "text-white";
  const bodyColor = isLight ? "text-stone-500" : "text-dark-400";
  const labelColor = isLight ? "text-stone-400" : "text-dark-400";
  const linkColor = isLight ? "text-stone-900 hover:text-stone-600" : "text-white hover:text-cherry-400";
  const linkUnderline = isLight ? "bg-stone-300 group-hover:bg-stone-400" : "bg-white/20 group-hover:bg-cherry-400/60";
  const imageBorder = isLight ? "border-stone-200" : "border-white/[0.06]";
  const imageBg = isLight ? "bg-stone-50" : "bg-dark-900";

  return (
    <section {...attrs} className={`py-24 md:py-36 ${bg} border-t ${border} ${className ?? ""}`} style={style}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className={`lg:col-span-5 ${isReversed ? "lg:order-2" : ""}`}>
            <div className={`inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-6 ${labelColor}`}>
              <span className={`w-8 h-px ${accent}`} />
              {isLight ? "" : "Showcase"}
            </div>
            <h2 className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] ${headingColor}`}>
              {headline}
            </h2>
            {description && <p className={`mt-6 text-lg leading-relaxed max-w-md ${bodyColor}`}>{description}</p>}
            {ctaText && (
              <a href={ctaHref} className={`mt-8 inline-flex items-center gap-3 font-semibold transition-colors duration-200 group ${linkColor}`}>
                <span className="relative">
                  {ctaText}
                  <span className={`absolute bottom-0 left-0 w-full h-px transition-colors duration-200 ${linkUnderline}`} />
                </span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </a>
            )}
          </div>
          <div className={`lg:col-span-7 ${isReversed ? "lg:order-1" : ""}`}>
            <div className="relative rounded-2xl overflow-hidden border shadow-2xl shadow-black/10" style={{ borderColor: isLight ? "#e7e5e4" : "rgba(255,255,255,0.06)", backgroundColor: isLight ? "#faf9f8" : "" }}>
              <img src={imageSrc} alt={imageAlt} className="w-full h-auto object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
