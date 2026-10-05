// bunny.net product names, spelled and capitalised as the product team does.
// On screen, name a product through this map, never a typed-out string, so a
// misspelling fails the typecheck. Add a product here before using it, and
// check the name against a current bunny.net source first.
export const PRODUCTS = {
  stream: "Bunny Stream",
  storage: "Bunny Storage",
  database: "Bunny Database",
  dns: "Bunny DNS",
  shield: "Bunny Shield",
  edgeScripting: "Edge Scripting",
  magicContainers: "Magic Containers",
  cli: "bunny.net CLI",
} as const;

export type ProductName = (typeof PRODUCTS)[keyof typeof PRODUCTS];
