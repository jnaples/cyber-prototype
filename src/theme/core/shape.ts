import type { BrandConfig } from "..";

export function generateShape(
  themeConfig: BrandConfig
): Record<"borderRadius", number> {
  return {
    borderRadius: themeConfig.shape.borderRadius,
  };
}
