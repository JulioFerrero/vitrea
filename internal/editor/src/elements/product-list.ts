import { defineElement, textField, referenceField } from "@vitrea/editor";

export const productList = defineElement({
  type: "product-list",
  label: "Product List",
  icon: "shopping-bag",
  category: "section",
  isContainer: false,
  defaultStyles: {},
  defaultData: {
    title: "Our Products",
  },
  fields: [
    textField("title", { label: "Section Title" }),
    referenceField("products", {
      label: "Products",
      collection: "product",
      multiple: true,
    }),
  ],
  styleGroups: ["spacing", "background"],
});
