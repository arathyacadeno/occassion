export interface Bouquet {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  image: string;
  occasion: 'romantic' | 'celebration' | 'sympathy' | 'wedding' | 'curated';
  rating: number;
  reviewsCount: number;
  stems: string[];
  description: string;
  flowerCount: string;
  scent: 'Subtle & Sweet' | 'Heirloom Rose' | 'Fresh & Green' | 'Exotic Musk';
  badge?: string;
  dimensions: string;
}

export interface FlowerProduct extends Bouquet {
  slug: string;
  category: string;
  images?: string[];
  colors?: string[];
  colorTag?: 'pink' | 'white' | 'red' | 'purple' | 'yellow';
  occasionsList?: string[];
  details?: string[];
}

export interface CategoryInfo {
  slug: string;
  name: string;
  type: 'type' | 'occasion' | 'color';
  title: string;
  headline: string;
  description: string;
  heroImage?: string;
}

export interface CartItem {
  bouquet: Bouquet;
  quantity: number;
  selectedSize: 'Petite' | 'Signature' | 'Grand Deluxe';
  customNote?: string;
  vaseOption: boolean;
}
