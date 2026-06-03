import type { ComponentType } from "react";
import type { ElementProps } from "@vitrea/render";
import { Section } from "./section.tsx";
import { Row } from "./row.tsx";
import { Column } from "./column.tsx";
import { Grid } from "./grid.tsx";
import { Heading } from "./heading.tsx";
import { Text } from "./text.tsx";
import { Image } from "./image.tsx";
import { Button } from "./button.tsx";
import { Link } from "./link.tsx";
import { Spacer } from "./spacer.tsx";
import { Divider } from "./divider.tsx";
import { Video } from "./video.tsx";
import { Html } from "./html.tsx";
import { NavBar } from "./nav-bar.tsx";
import { HeroSection } from "./hero-section.tsx";
import { FeaturesSection } from "./features-section.tsx";
import { ShowcaseSection } from "./showcase-section.tsx";
import { CTASection } from "./cta-section.tsx";
import { FooterSection } from "./footer-section.tsx";
import { ProductList } from "./product-list.tsx";

export const COMPONENT_REGISTRY: Record<string, ComponentType<ElementProps>> = {
  section: Section,
  row: Row,
  column: Column,
  grid: Grid,
  heading: Heading,
  text: Text,
  image: Image,
  button: Button,
  link: Link,
  spacer: Spacer,
  divider: Divider,
  video: Video,
  html: Html,
  "nav-bar": NavBar,
  "hero-section": HeroSection,
  "features-section": FeaturesSection,
  "showcase-section": ShowcaseSection,
  "cta-section": CTASection,
  "footer-section": FooterSection,
  "product-list": ProductList,
};

export function hasComponent(type: string): boolean {
  return type in COMPONENT_REGISTRY;
}
