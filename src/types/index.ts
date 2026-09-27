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

export interface CartItem {
  bouquet: Bouquet;
  quantity: number;
  selectedSize: 'Petite' | 'Signature' | 'Grand Deluxe';
  customNote?: string;
  vaseOption: boolean;
}
