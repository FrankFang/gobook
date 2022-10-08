import type { AttributifyAttributes } from "@unocss/preset-attributify";

declare module "react" {
  interface HTMLAttributes<T> extends AttributifyAttributes {
    block?: boolean;
    relative?: boolean;
    absolute?: boolean;
  }
}

declare global {
}
