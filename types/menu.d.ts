export type PlanTier = 'free' | 'pro';
export type PriceMode = 'fixed' | 'per_weight' | 'per_quantity';

export interface MenuItemOption {
  id: string;
  label: string;
  price: number;
  unitLabel?: string;
  position?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  priceMode: PriceMode;
  unitLabel?: string;
  options?: MenuItemOption[];
}

export interface MenuCategory {
  id: string;
  title: string;
  position?: number;
  items: MenuItem[];
}

export interface RestaurantProfile {
  id: string;
  name: string;
  slug: string;
  heroImage: string;
  description: string;
  address: string;
  phone: string;
  plan: PlanTier;
  qrCodeUrl?: string;
}

export interface RestaurantMenu {
  restaurant: RestaurantProfile;
  categories: MenuCategory[];
  featuredItems?: MenuItem[];
}

export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  pricePerMonth: number;
  features: string[];
  isPopular?: boolean;
  limit?: number;
}
