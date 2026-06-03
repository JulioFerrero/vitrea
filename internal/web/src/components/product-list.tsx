"use client";

import type { ElementProps } from "@vitrea/render";

interface ProductData {
  id?: string;
  _id?: string;
  data?: Record<string, unknown>;
  name?: string;
  subtitle?: string;
  price?: string;
  ctaText?: string;
  ctaUrl?: string;
  image?: string;
}

function getField(p: ProductData, field: string): string | undefined {
  if (p.data && typeof p.data[field] === "string") return p.data[field] as string;
  if (typeof (p as Record<string, unknown>)[field] === "string") return (p as Record<string, unknown>)[field] as string;
  return undefined;
}

export function ProductList({ element, className, style, attrs }: ElementProps) {
  const title = (element.data.title as string) ?? "Our Products";
  const rawProducts = element.data.products;

  if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
    return (
      <section {...attrs} className={`py-24 bg-dark-950 ${className ?? ""}`} style={style}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">{title}</h2>
          <p className="text-lg text-dark-400">No products selected yet.</p>
        </div>
      </section>
    );
  }

  const products = rawProducts as ProductData[];

  return (
    <section {...attrs} className={`py-24 bg-dark-950 ${className ?? ""}`} style={style}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white text-center tracking-tight mb-16">{title}</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p, i) => {
            const name = getField(p, "name") ?? "Untitled";
            const subtitle = getField(p, "subtitle");
            const price = getField(p, "price");
            const ctaText = getField(p, "ctaText") ?? "Shop Now";
            const ctaUrl = getField(p, "ctaUrl") ?? "#";
            const image = getField(p, "image");

            return (
              <div
                key={p.id ?? p._id ?? i}
                className="group relative rounded-2xl border border-white/[0.06] bg-dark-900/50 overflow-hidden hover:border-cherry-900/30 transition-all duration-500 hover:shadow-lg hover:shadow-cherry-950/20 flex flex-col"
              >
                <div className="aspect-square bg-dark-800 overflow-hidden">
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-dark-600">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
                  {subtitle && (
                    <p className="text-sm text-dark-400 mb-4">{subtitle}</p>
                  )}
                  <div className="flex items-end justify-between mt-auto">
                    {price && (
                      <span className="text-xl font-bold text-white">{price}</span>
                    )}
                    <a
                      href={ctaUrl}
                      className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-cherry-400 transition-colors duration-200 group/link"
                    >
                      {ctaText}
                      <span className="inline-block transition-transform duration-200 group-hover/link:translate-x-1">&rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
