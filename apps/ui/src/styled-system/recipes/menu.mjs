import { compact, getSlotCompoundVariant, memo, splitProps } from '../helpers.mjs';
import { createRecipe } from './create-recipe.mjs';

const menuDefaultVariants = {
  "size": "md"
}
const menuCompoundVariants = []

const menuSlotNames = [
  [
    "contextTrigger",
    "menu__contextTrigger"
  ],
  [
    "trigger",
    "menu__trigger"
  ],
  [
    "triggerItem",
    "menu__triggerItem"
  ],
  [
    "indicator",
    "menu__indicator"
  ],
  [
    "positioner",
    "menu__positioner"
  ],
  [
    "arrow",
    "menu__arrow"
  ],
  [
    "arrowTip",
    "menu__arrowTip"
  ],
  [
    "content",
    "menu__content"
  ],
  [
    "separator",
    "menu__separator"
  ],
  [
    "item",
    "menu__item"
  ],
  [
    "optionItem",
    "menu__optionItem"
  ],
  [
    "optionItemIndicator",
    "menu__optionItemIndicator"
  ],
  [
    "optionItemText",
    "menu__optionItemText"
  ],
  [
    "itemGroupLabel",
    "menu__itemGroupLabel"
  ],
  [
    "itemGroup",
    "menu__itemGroup"
  ]
]
const menuSlotFns = /* @__PURE__ */ menuSlotNames.map(([slotName, slotKey]) => [slotName, createRecipe(slotKey, menuDefaultVariants, getSlotCompoundVariant(menuCompoundVariants, slotName))])

const menuFn = memo((props = {}) => {
  return Object.fromEntries(menuSlotFns.map(([slotName, slotFn]) => [slotName, slotFn.recipeFn(props)]))
})

const menuVariantKeys = [
  "size"
]
const getVariantProps = (variants) => ({ ...menuDefaultVariants, ...compact(variants) })

export const menu = /* @__PURE__ */ Object.assign(menuFn, {
  __recipe__: false,
  __name__: 'menu',
  raw: (props) => props,
  variantKeys: menuVariantKeys,
  variantMap: {
  "size": [
    "xs",
    "sm",
    "md",
    "lg"
  ]
},
  splitVariantProps(props) {
    return splitProps(props, menuVariantKeys)
  },
  getVariantProps
})