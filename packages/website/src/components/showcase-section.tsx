import type { ElementProps } from "@hi/render";

export function ShowcaseSection({ element, className, style, attrs }: ElementProps) {
  const headline = (element.data.headline as string) ?? "Design with precision";
  const description = (element.data.description as string) ?? "";
  const ctaText = element.data.ctaText as string | undefined;
  const ctaHref = (element.data.ctaHref as string) ?? "#";
  const imageSrc = (element.data.imageSrc as string) ?? "https://placehold.co/800x500/171717/525252?text=Hi+Editor";
  const imageAlt = (element.data.imageAlt as string) ?? "Showcase";
  const variant = (element.data.variant as string) ?? "image-right";

  const isReversed = variant === "image-left";

  return (
    <section
      {...attrs}
      className={`py-24 md:py-36 bg-dark-950 border-t border-white/[0.04] ${className ?? ""}`}
      style={style}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className={`lg:col-span-5 ${isReversed ? "lg:order-2" : ""}`}>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-dark-400 uppercase tracking-wider mb-6">
              <span className="w-8 h-px bg-cherry-600" />
              Showcase
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.1]">
              {headline}
            </h2>
            {description && (
              <p className="mt-6 text-lg text-dark-400 leading-relaxed max-w-md">
                {description}
              </p>
            )}
            {ctaText && (
              <a
                href={ctaHref}
                className="mt-8 inline-flex items-center gap-3 text-white font-semibold hover:text-cherry-400 transition-colors duration-200 group"
              >
                <span className="relative">
                  {ctaText}
                  <span className="absolute bottom-0 left-0 w-full h-px bg-white/20 group-hover:bg-cherry-400/60 transition-colors duration-200" />
                </span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </a>
            )}
          </div>

          <div className={`lg:col-span-7 ${isReversed ? "lg:order-1" : ""}`}>
            <div className="group relative">
              <div className="absolute -inset-4 bg-cherry-600/[0.05] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" />
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/40 bg-dark-900">
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
