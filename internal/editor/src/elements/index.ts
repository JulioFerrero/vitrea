import type { EditorSchema } from "@vitrea/editor";
import {
  sectionElement, rowElement, columnElement, gridElement,
  headingElement, textElement, imageElement, buttonElement,
  linkElement, dividerElement, spacerElement, videoElement, htmlElement,
  spacingStyles, sizingStyles, typographyStyles, backgroundStyles,
  layoutStyles, borderStyles, effectsStyles,
} from "@vitrea/editor";

import { navBar } from "./nav-bar.ts";
import { heroSection } from "./hero-section.ts";
import { featuresSection } from "./features-section.ts";
import { showcaseSection } from "./showcase-section.ts";
import { ctaSection } from "./cta-section.ts";
import { footerSection } from "./footer-section.ts";
import { productList } from "./product-list.ts";
import { content } from "./content.ts";
import { cmsStructure } from "./structure.ts";

export const elements = [
  sectionElement,
  rowElement,
  columnElement,
  gridElement,
  headingElement,
  textElement,
  imageElement,
  buttonElement,
  linkElement,
  dividerElement,
  spacerElement,
  videoElement,
  htmlElement,
  navBar,
  heroSection,
  featuresSection,
  showcaseSection,
  ctaSection,
  footerSection,
  productList,
];

export const schema: EditorSchema = {
  elementTypes: elements,
  styleGroups: {
    spacing: spacingStyles,
    sizing: sizingStyles,
    typography: typographyStyles,
    background: backgroundStyles,
    layout: layoutStyles,
    border: borderStyles,
    effects: effectsStyles,
  },
  content,
  structure: cmsStructure,
};
