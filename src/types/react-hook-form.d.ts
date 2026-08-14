import "react-hook-form";

declare module "react-hook-form" {
  export type UnpackNestedValue<T> = T;
}