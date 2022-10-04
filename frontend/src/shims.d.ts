import type { AttributifyAttributes } from "@unocss/preset-attributify";

declare module "react" {
  interface HTMLAttributes<T> extends AttributifyAttributes {
    block?: boolean;
    flex?: boolean;
    shadow?: boolean;
  }
}

declare global {
  const LoadChapters = (p: any) => any
}
