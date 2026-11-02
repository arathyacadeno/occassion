export interface FlowerVarietyOption {
  id: string;
  name: string;
  extraPrice: number;
  image?: string;
  description?: string;
}

export interface BouquetSizeOption {
  id: "small" | "medium" | "large" | "premium";
  name: string;
  stemsText: string;
  extraPrice: number;
  isDefault?: boolean;
}

export interface WrappingOption {
  id: string;
  name: string;
  extraPrice: number;
  colorCode?: string;
  image?: string;
}

export interface RibbonOption {
  id: string;
  name: string;
  colorCode: string;
  extraPrice: number;
}

export interface DecorationOption {
  id: string;
  name: string;
  extraPrice: number;
  description?: string;
}

export interface CustomizerAddonOption {
  id: string;
  name: string;
  category: "wrapping" | "chocolate" | "card" | "ribbon" | "gift";
  extraPrice: number;
  image: string;
  description?: string;
}

export interface ProductCustomizationConfig {
  productId: string;
  enabled: boolean;
  basePrice: number;
  flowerCategory: string;
  flowerOptions: FlowerVarietyOption[];
  sizes: BouquetSizeOption[];
  wrappingPapers: WrappingOption[];
  ribbonColors: RibbonOption[];
  decorations: DecorationOption[];
  addons?: CustomizerAddonOption[];
  allowCustomNote?: boolean;
}

export interface ItemCustomization {
  isCustomized: boolean;
  productId: string;
  productName: string;
  productImage: string;
  flowerCategory: string;
  flowerVariety?: FlowerVarietyOption;
  size: BouquetSizeOption;
  wrapping?: WrappingOption;
  ribbon?: RibbonOption;
  decorations: DecorationOption[];
  addons?: CustomizerAddonOption[];
  basePrice: number;
  customizationCharges: number;
  finalPrice: number;
  customNote?: string;
  summaryText: string;
}
