# @vitrea/cms

CMS schema builders and query helpers for Vitrea.

Use this package to define collections, fields, and editor structure for content managed inside the Vitrea editor.

## Install

```bash
pnpm add @vitrea/cms
```

## Example

```ts
import { defineCollection, textField, defineStructure, S } from "@vitrea/cms";

const posts = defineCollection({
  name: "posts",
  label: "Posts",
  fields: [textField({ name: "title", label: "Title" })],
});

const structure = defineStructure((S) => [
  S.list().title("Content").items([
    S.collection("posts").title("Posts"),
  ]),
]);
```
