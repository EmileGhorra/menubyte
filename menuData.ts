// NOTE: Static fallback data mirrors Supabase schema; keep sample categories/items aligned with new fields.
import type {
  MenuItem,
  MenuItemOption,
  PlanTier,
  PriceMode,
  RestaurantMenu,
  SubscriptionPlan,
} from './types/menu';

export const FREE_ITEM_LIMIT = 50;

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    pricePerMonth: 0,
    features: [
      'Up to 50 items',
      'MenuByte ads on your menu page',
      'Email support',
      'No image uploads',
    ],
    limit: FREE_ITEM_LIMIT,
  },
  {
    id: 'pro',
    name: 'Pro',
    pricePerMonth: 39,
    features: [
      'Unlimited items',
      'Upload custom images',
      'Ad-free public menu',
      'Priority support',
    ],
    isPopular: true,
  },
];

const addPricing = (
  item: Omit<MenuItem, 'priceMode' | 'unitLabel' | 'options'> & {
    priceMode?: PriceMode;
    unitLabel?: string;
    options?: MenuItemOption[];
  },
): MenuItem => ({
  ...item,
  priceMode: item.priceMode ?? 'fixed',
  unitLabel: item.unitLabel,
  options: item.options,
});

export const menuData: RestaurantMenu[] = [
  {
    restaurant: {
      id: 'rst-italia',
      slug: 'ristorante-italia',
      name: 'Ristorante Italia',
      description: 'Authentic Italian cuisine crafted with seasonal ingredients.',
      heroImage: 'https://images.unsplash.com/photo-1529042410759-befb1204b468',
      address: '85 Mulberry Street, New York City',
      phone: '+1 (212) 555-0152',
      plan: 'pro',
    },
    categories: [
      {
        id: 'starters',
        title: 'Starters',
        position: 0,
        items: [
          addPricing({
            id: 'bruschetta',
            name: 'Bruschetta Trio',
            description: 'Grilled sourdough with heirloom tomato, mushroom, and artichoke toppings.',
            price: 14,
            category: 'Starters',
            imageUrl: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856',
            isAvailable: true,
          }),
          addPricing({
            id: 'arancini',
            name: 'Smoked Mozzarella Arancini',
            description: 'Crispy risotto fritters served with spicy arrabbiata sauce.',
            price: 12,
            category: 'Starters',
            imageUrl: 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9',
            isAvailable: true,
          }),
        ],
      },
      {
        id: 'mains',
        title: 'Chef Specials',
        position: 1,
        items: [
          addPricing({
            id: 'carbonara',
            name: 'Truffle Carbonara',
            description: 'House-made tagliatelle, guanciale, pecorino romano, shaved truffle.',
            price: 28,
            category: 'Chef Specials',
            imageUrl: 'https://images.unsplash.com/photo-1525755662778-989d0524087e',
            isAvailable: true,
          }),
          addPricing({
            id: 'branzino',
            name: 'Mediterranean Branzino',
            description: 'Roasted branzino with charred lemon, olives, and fennel salad.',
            price: 34,
            category: 'Chef Specials',
            imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
            isAvailable: false,
            priceMode: 'per_weight',
            unitLabel: 'per 200g',
            options: [
              { id: 'branzino-200', label: '200g', price: 34, unitLabel: 'per 200g' },
              { id: 'branzino-400', label: '400g', price: 58, unitLabel: 'per 400g' },
            ],
          }),
        ],
      },
    ],
  },
  {
    restaurant: {
      id: 'rst-bistro',
      slug: 'garden-bistro',
      name: 'Garden Bistro',
      description: 'Fresh, vibrant dishes inspired by the California coast.',
      heroImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
      address: '501 Sunset Blvd, Los Angeles',
      phone: '+1 (310) 555-0119',
      plan: 'free',
    },
    categories: [
      {
        id: 'plates',
        title: 'Bright Plates',
        position: 0,
        items: [
          addPricing({
            id: 'avo-toast',
            name: 'Citrus Avocado Toast',
            description: 'Sourdough, whipped feta, watermelon radish, chili oil.',
            price: 16,
            category: 'Bright Plates',
            imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8',
            isAvailable: true,
          }),
          addPricing({
            id: 'grain-bowl',
            name: 'Golden Grain Bowl',
            description: 'Farro, roasted veggies, almond pesto, farm egg.',
            price: 18,
            category: 'Bright Plates',
            imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
            isAvailable: true,
            priceMode: 'per_quantity',
            unitLabel: 'per bowl',
            options: [
              { id: 'grain-single', label: 'Single bowl', price: 18, unitLabel: 'per bowl' },
              { id: 'grain-family', label: 'Family size', price: 32, unitLabel: 'serves 3' },
            ],
          }),
        ],
      },
      {
        id: 'drinks',
        title: 'Signature Sips',
        position: 1,
        items: [
          addPricing({
            id: 'sunset-spritz',
            name: 'Sunset Spritz',
            description: 'Blood orange, elderflower, soda, rosemary.',
            price: 12,
            category: 'Signature Sips',
            imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
            isAvailable: true,
          }),
          addPricing({
            id: 'garden-tonic',
            name: 'Garden Tonic',
            description: 'Cucumber, mint, tonic, yuzu bitters.',
            price: 11,
            category: 'Signature Sips',
            imageUrl: 'https://images.unsplash.com/photo-1459802071246-377c0346da93',
            isAvailable: true,
          }),
        ],
      },
    ],
  },
];

export const getRestaurantBySlug = (slug: string) =>
  menuData.find((entry) => entry.restaurant.slug === slug);
