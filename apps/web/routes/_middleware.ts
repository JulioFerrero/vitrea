import { define } from "../utils.ts";
import { tailwindHtmlMiddleware } from "@hi/website";

const mw = tailwindHtmlMiddleware();

export default define.middleware(async (ctx) => {
  return mw(ctx, () => ctx.next());
});