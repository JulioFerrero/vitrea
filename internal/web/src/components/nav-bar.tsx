import type { ElementProps } from "@vitrea/render";

export function NavBar({ element, className, style, attrs }: ElementProps) {
  const isLight = element.data.theme === "light";
  const brandName = (element.data.brandName as string) ?? "Hi Editor";
  const link1Text = element.data.link1Text as string | undefined;
  const link1Href = (element.data.link1Href as string) ?? "#";
  const link2Text = element.data.link2Text as string | undefined;
  const link2Href = (element.data.link2Href as string) ?? "#";
  const link3Text = element.data.link3Text as string | undefined;
  const link3Href = (element.data.link3Href as string) ?? "#";
  const ctaText = (element.data.ctaText as string) ?? "Get Started";
  const ctaHref = (element.data.ctaHref as string) ?? "#";

  const navBg = isLight ? "bg-white/70" : "bg-dark-950/70";
  const navBorder = isLight ? "border-stone-200/80" : "border-white/[0.06]";
  const brandColor = isLight ? "text-stone-900" : "text-white";
  const brandIcon = isLight ? "bg-stone-900 text-white" : "bg-cherry-600 text-white";
  const linkColor = isLight ? "text-stone-500 hover:text-stone-900 hover:bg-stone-100" : "text-dark-400 hover:text-white hover:bg-white/[0.05]";
  const ctaClass = isLight ? "bg-stone-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-stone-800 active:scale-[0.98]" : "bg-white text-dark-950 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-dark-100 active:scale-[0.98]";

  return (
    <nav {...attrs} className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b ${navBg} ${navBorder} ${className ?? ""}`} style={style}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <a href="/" className={`font-display text-xl font-bold tracking-tight flex items-center gap-3 group ${brandColor}`}>
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold font-sans transition-colors duration-300 ${brandIcon}`}>{brandName[0]}</span>
          {brandName}
        </a>
        <div className="hidden md:flex items-center gap-1">
          {link1Text && <a href={link1Href} className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${linkColor}`}>{link1Text}</a>}
          {link2Text && <a href={link2Href} className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${linkColor}`}>{link2Text}</a>}
          {link3Text && <a href={link3Href} className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${linkColor}`}>{link3Text}</a>}
        </div>
        <a href={ctaHref} className={ctaClass}>{ctaText}</a>
      </div>
    </nav>
  );
}
