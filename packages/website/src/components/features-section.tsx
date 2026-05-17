import React from "react";
import type { ElementProps } from "../lib/types";

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

  const spans = features.length === 4
    ? ["sm:col-span-2", "sm:col-span-1", "sm:col-span-1", "sm:col-span-2"]
    : features.length === 5
    ? ["sm:col-span-2", "sm:col-span-1", "sm:col-span-1", "sm:col-span-2", "sm:col-span-2"]
    : features.map(() => "");

  return (
    <section
      {...attrs}
      id="features"
      className={`py-24 md:py-36 bg-warm-50 ${className ?? ""}`}
      style={style}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight leading-[1.05]">
            {headline}
          </h2>
          {subtitle && (
            <p className="mt-5 text-lg text-stone-400 leading-relaxed max-w-lg">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`mt-16 grid sm:grid-cols-3 gap-4 ${features.length > 3 ? "lg:grid-cols-4" : ""}`}>
          {features.map((f, i) => (
            <div
              key={i}
              className={`${spans[i] ?? ""} group relative rounded-2xl border border-stone-200/80 bg-white p-8 md:p-10 hover:border-cherry-200/80 transition-all duration-500 hover:shadow-lg hover:shadow-cherry-100/20`}
            >
              <div className="absolute top-8 right-8 text-7xl font-display font-bold text-stone-50 group-hover:text-cherry-50 transition-colors duration-500 leading-none select-none">
                {String(i + 1).padStart(2, "0")}
              </div>

              <div className="relative">
                <h3 className="text-xl font-semibold text-stone-900 mb-3 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-stone-400 leading-relaxed text-[15px]">
                  {f.description}
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cherry-400 to-cherry-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
