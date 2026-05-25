import React from "react";
import type { EditorSchema, RendererAdapter } from "@hi/editor";
import {
  sectionElement, rowElement, columnElement, gridElement,
  headingElement, textElement, imageElement, buttonElement,
  linkElement, dividerElement, spacerElement, videoElement, htmlElement,
  spacingStyles, sizingStyles, typographyStyles, backgroundStyles,
  layoutStyles, borderStyles, effectsStyles,
} from "@hi/editor";
import { RenderPage } from "@hi/render";
import { COMPONENT_REGISTRY } from "../components";

import { navBar } from "./nav-bar";
import { heroSection } from "./hero-section";
import { featuresSection } from "./features-section";
import { showcaseSection } from "./showcase-section";
import { ctaSection } from "./cta-section";
import { footerSection } from "./footer-section";
import { productList } from "./product-list";
import { content } from "./content";
import { cmsStructure } from "./structure";

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

export const websiteRenderer: RendererAdapter = {
  PageRenderer: (props) => React.createElement(RenderPage, { ...props, renderer: COMPONENT_REGISTRY }),
};
