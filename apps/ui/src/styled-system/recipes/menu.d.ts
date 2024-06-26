/* eslint-disable */
import type { ConditionalValue } from '../types/index';
import type { DistributiveOmit, Pretty } from '../types/system-types';

interface MenuVariant {
  size: "xs" | "sm" | "md" | "lg"
}

type MenuVariantMap = {
  [key in keyof MenuVariant]: Array<MenuVariant[key]>
}

export type MenuVariantProps = {
  [key in keyof MenuVariant]?: ConditionalValue<MenuVariant[key]> | undefined
}

export interface MenuRecipe {
  __type: MenuVariantProps
  (props?: MenuVariantProps): Pretty<Record<"contextTrigger" | "trigger" | "triggerItem" | "indicator" | "positioner" | "arrow" | "arrowTip" | "content" | "separator" | "item" | "optionItem" | "optionItemIndicator" | "optionItemText" | "itemGroupLabel" | "itemGroup", string>>
  raw: (props?: MenuVariantProps) => MenuVariantProps
  variantMap: MenuVariantMap
  variantKeys: Array<keyof MenuVariant>
  splitVariantProps<Props extends MenuVariantProps>(props: Props): [MenuVariantProps, Pretty<DistributiveOmit<Props, keyof MenuVariantProps>>]
  getVariantProps: (props?: MenuVariantProps) => MenuVariantProps
}


export declare const menu: MenuRecipe