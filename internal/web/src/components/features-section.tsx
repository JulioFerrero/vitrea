import type { ElementProps } from "@vitrea/render";

interface Feature {
  title: string;
  description: string;
}

export function FeaturesSection({ element, className, style, attrs }: ElementProps) {
  const headline = (element.data.headline as string) ?? "Features";
  const subtitle = element.data.subtitle as string | undefined;
  const rawFeatures = element.data.features as Feature[] | undefined;
  const features: Feature[] = Array.isArray(rawFeatures) && rawFeatures.length > 0
    ? rawFeatures
    : [
        { title: "Feature One", description: "A great feature description." },
        { title: "Feature Two", description: "Another compelling feature." },
        { title: "Feature Three", description: "One more reason to love it." },
      ];

  const gridClass = features.length <= 3
    ? "sm:grid-cols-2 lg:grid-cols-3"
    : features.length === 4
    ? "sm:grid-cols-2 lg:grid-cols-4"
    : "sm:grid-cols-2 lg:grid-cols-3";

  const spanClass = features.length === 5
    ? ["lg:col-span-2", "", "", "lg:col-span-2", ""]
    : features.length === 4
    ? ["sm:col-span-2", "", "", "sm:col-span-2"]
    : [];

  return (
    <section
      {...attrs}
      id="features"
      className={`py-24 md:py-36 bg-dark-950 ${className ?? ""}`}
      style={style}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          <div className="lg:col-span-5">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05]">
              {headline}
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 flex items-end">
            {subtitle && (
              <p className="text-lg text-dark-400 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className={`grid ${gridClass} gap-4`}>
          {features.map((f, i) => (
            <div
              key={i}
              className={`${spanClass[i] ?? ""} group relative rounded-2xl border border-white/[0.06] bg-dark-900/50 p-8 md:p-10 hover:border-cherry-900/40 transition-all duration-500 hover:shadow-lg hover:shadow-cherry-950/30 hover:bg-dark-900/80`}
            >
              <div className="absolute top-8 right-8 text-7xl font-display font-bold text-white/[0.03] group-hover:text-cherry-900/30 transition-colors duration-500 leading-none select-none">
                {String(i + 1).padStart(2, "0")}
              </div>

              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-cherry-950/50 border border-cherry-900/30 flex items-center justify-center mb-6 group-hover:bg-cherry-900/40 transition-colors duration-500">
                  <span className="text-cherry-400 text-sm font-bold font-mono">0{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-dark-400 leading-relaxed text-[15px]">
                  {f.description}
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-cherry-600/0 via-cherry-600/0 to-cherry-600/0 group-hover:via-cherry-600/40 transition-all duration-500 rounded-b-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
