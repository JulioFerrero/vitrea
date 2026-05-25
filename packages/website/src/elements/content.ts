import { defineCollection, textField, textareaField, imageField, urlField, arrayField, referenceField, selectField } from "@hi/cms";

export const product = defineCollection({
  name: "product",
  label: "Product",
  icon: "package",
  fields: [
    textField("name", { label: "Product Name", required: true }),
    textField("subtitle", { label: "Subtitle" }),
    textField("price", { label: "Price" }),
    textField("ctaText", { label: "CTA Text", default: "Buy Now" }),
    urlField("ctaUrl", { label: "CTA URL" }),
    imageField("image", { label: "Product Image" }),
    selectField("category", { label: "Category", options: ["shoes", "hats", "tshirts", "accessories"] }),
  ],
});

export const post = defineCollection({
  name: "post",
  label: "Blog Post",
  icon: "file-text",
  fields: [
    textField("title", { label: "Title", required: true }),
    textField("slug", { label: "Slug" }),
    textareaField("excerpt", { label: "Excerpt" }),
    textareaField("body", { label: "Body" }),
    imageField("coverImage", { label: "Cover Image" }),
    textField("author", { label: "Author" }),
  ],
});

export const faq = defineCollection({
  name: "faq",
  label: "FAQ",
  icon: "help-circle",
  fields: [
    textField("title", { label: "Title" }),
    arrayField("questions", {
      label: "Questions",
      preview: "question",
      of: [
        textField("question", { label: "Question" }),
        textareaField("answer", { label: "Answer" }),
      ],
    }),
  ],
});

export const content = [product, post, faq];
