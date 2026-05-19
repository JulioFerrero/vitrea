import type { ElementProps } from "@hi/render";

export function NavBar({ element, className, style, attrs }: ElementProps) {
  const brandName = (element.data.brandName as string) ?? "Hi Editor";
  const link1Text = element.data.link1Text as string | undefined;
  const link1Href = (element.data.link1Href as string) ?? "#";
  const link2Text = element.data.link2Text as string | undefined;
  const link2Href = (element.data.link2Href as string) ?? "#";
  const link3Text = element.data.link3Text as string | undefined;
  const link3Href = (element.data.link3Href as string) ?? "#";
  const ctaText = (element.data.ctaText as string) ?? "Get Started";
  const ctaHref = (element.data.ctaHref as string) ?? "#";

  return (
    <nav
      {...attrs}
      className={`fixed top-0 left-0 right-0 z-50 bg-dark-950/70 backdrop-blur-2xl border-b border-white/[0.06] ${className ?? ""}`}
      style={style}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <a href="/" className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-3 group">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-cherry-600 text-white text-xs font-bold font-sans group-hover:bg-cherry-500 transition-colors duration-300">H</span>
          {brandName}
        </a>

        <div className="hidden md:flex items-center gap-1">
          {link1Text && (
            <a href={link1Href} className="px-4 py-2 text-sm text-dark-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/[0.05]">
              {link1Text}
            </a>
          )}
          {link2Text && (
            <a href={link2Href} className="px-4 py-2 text-sm text-dark-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/[0.05]">
              {link2Text}
            </a>
          )}
          {link3Text && (
            <a href={link3Href} className="px-4 py-2 text-sm text-dark-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/[0.05]">
              {link3Text}
            </a>
          )}
        </div>

        <a
          href={ctaHref}
          className="bg-white text-dark-950 text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 hover:bg-dark-100 active:scale-[0.98]"
        >
          {ctaText}
        </a>
      </div>
    </nav>
  );
}
