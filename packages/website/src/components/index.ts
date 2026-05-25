import type { ComponentType } from "react";
import type { ElementProps } from "@hi/render";
import { Section } from "./section";
import { Row } from "./row";
import { Column } from "./column";
import { Grid } from "./grid";
import { Heading } from "./heading";
import { Text } from "./text";
import { Image } from "./image";
import { Button } from "./button";
import { Link } from "./link";
import { Spacer } from "./spacer";
import { Divider } from "./divider";
import { Video } from "./video";
import { Html } from "./html";
import { NavBar } from "./nav-bar";
import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { ShowcaseSection } from "./showcase-section";
import { CTASection } from "./cta-section";
import { FooterSection } from "./footer-section";
import { ProductList } from "./product-list";

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
