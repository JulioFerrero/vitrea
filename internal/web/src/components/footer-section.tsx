import type { ElementProps } from "@vitrea/render";

export function FooterSection({ element, className, style, attrs }: ElementProps) {
  const isLight = element.data.theme === "light";
  const brandName = (element.data.brandName as string) ?? "Hi Editor";
  const description = (element.data.description as string) ?? "";
  const copyrightText = (element.data.copyrightText as string) ?? "© 2026 Hi Editor";
  const link1Text = element.data.link1Text as string | undefined;
  const link1Href = (element.data.link1Href as string) ?? "#";
  const link2Text = element.data.link2Text as string | undefined;
  const link2Href = (element.data.link2Href as string) ?? "#";
  const link3Text = element.data.link3Text as string | undefined;
  const link3Href = (element.data.link3Href as string) ?? "#";
  const link4Text = element.data.link4Text as string | undefined;
  const link4Href = (element.data.link4Href as string) ?? "#";

  const links = [{ text: link1Text, href: link1Href }, { text: link2Text, href: link2Href }, { text: link3Text, href: link3Href }, { text: link4Text, href: link4Href }].filter((l) => l.text);

  const bg = isLight ? "bg-white" : "bg-dark-950";
  const border = isLight ? "border-stone-200" : "border-white/[0.06]";
  const brandColor = isLight ? "text-stone-900" : "text-white";
  const brandIcon = isLight ? "bg-stone-900 text-white" : "bg-cherry-600 text-white";
  const descColor = isLight ? "text-stone-500" : "text-dark-500";
  const headingColor = isLight ? "text-stone-400" : "text-dark-300";
  const linkColor = isLight ? "text-stone-500 hover:text-stone-900" : "text-dark-500 hover:text-white";
  const bottomBorder = isLight ? "border-stone-200" : "border-white/[0.04]";
  const bottomColor = isLight ? "text-stone-400" : "text-dark-600";

  return (
    <footer {...attrs} className={`border-t ${border} ${bg} ${className ?? ""}`} style={style}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 md:py-20">
        <div className="grid md:grid-cols-12 gap-10 md:gap-6">
          <div className="md:col-span-5 lg:col-span-6">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-[10px] font-bold font-sans ${brandIcon}`}>{brandName[0]}</span>
              <span className={`font-display text-lg font-bold tracking-tight ${brandColor}`}>{brandName}</span>
            </div>
            {description && <p className={`mt-4 text-sm leading-relaxed max-w-xs ${descColor}`}>{description}</p>}
          </div>
          <div className="md:col-span-7 lg:col-span-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <div className={`text-xs font-semibold uppercase tracking-wider mb-4 ${headingColor}`}>Product</div>
                {links.slice(0, 2).map((l, i) => (
                  <a key={i} href={l.href} className={`block text-sm transition-colors duration-200 mb-2.5 ${linkColor}`}>{l.text}</a>
                ))}
              </div>
              {links.length > 2 && (
                <div>
                  <div className={`text-xs font-semibold uppercase tracking-wider mb-4 ${headingColor}`}>Resources</div>
                  {links.slice(2).map((l, i) => (
                    <a key={i} href={l.href} className={`block text-sm transition-colors duration-200 mb-2.5 ${linkColor}`}>{l.text}</a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={`mt-14 pt-8 border-t ${bottomBorder} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}>
          <div className={`text-xs ${bottomColor}`}>{copyrightText}</div>
          <div className={`text-xs ${bottomColor}`}>Built with Hi Editor</div>
        </div>
      </div>
    </footer>
  );
}
