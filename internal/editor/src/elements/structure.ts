import { defineStructure, S } from "@vitrea/cms";

export const cmsStructure = defineStructure((S) => [
  S.list().title("Products").items([
    S.collection("product").title("All Products"),
    S.collection("product").title("Shoes").filter("category", "shoes"),
    S.collection("product").title("Hats").filter("category", "hats"),
    S.collection("product").title("T-Shirts").filter("category", "tshirts"),
    S.collection("product").title("Accessories").filter("category", "accessories"),
  ]),

  S.divider(),

  S.list().title("Content").items([
    S.collection("post").title("Blog Posts"),
    S.collection("faq").title("FAQs"),
  ]),
]);
