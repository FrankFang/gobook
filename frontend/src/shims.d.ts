import type { AttributifyAttributes } from "@unocss/preset-attributify";

declare module "react" {
  interface HTMLAttributes<T> extends AttributifyAttributes {
    block?: boolean;
    flex?: boolean;
    shadow?: boolean;
  }
}

declare global {
  declare namespace main {
    type Book = any;
    type Chapter = any
  }
  const LoadChapters = (p: any) => any
}
