// src/data/products.js
export const products = [
  {
    id: 1,
    name: 'Fresh Tomatoes (1kg)',
    category: 'Vegetables',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80',
    description: 'Farm-fresh ripe tomatoes, perfect for soups and stews.',
    inStock: true,
    badge: 'Fresh',
  },
  {
    id: 2,
    name: 'Assorted Peppers (500g)',
    category: 'Vegetables',
    price: 800,
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80',
    description: 'A mix of red, green, and yellow bell peppers.',
    inStock: true,
    badge: 'Popular',
  },
  {
    id: 3,
    name: 'Premium Basmati Rice (5kg)',
    category: 'Grains',
    price: 9500,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
    description: 'Long-grain aromatic basmati rice, imported quality.',
    inStock: true,
    badge: null,
  },
  {
    id: 4,
    name: 'Fresh Spinach (Bunch)',
    category: 'Vegetables',
    price: 500,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
    description: 'Tender young spinach leaves, washed and ready to cook.',
    inStock: true,
    badge: 'Organic',
  },
  {
    id: 5,
    name: 'Chicken Breast (1kg)',
    category: 'Proteins',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80',
    description: 'Boneless skinless chicken breast, fresh from the farm.',
    inStock: true,
    badge: 'Fresh',
  },
  {
    id: 6,
    name: 'Sweet Plantains (3 pcs)',
    category: 'Fruits',
    price: 700,
    image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&q=80',
    description: 'Ripe sweet plantains, perfect for frying or grilling.',
    inStock: true,
    badge: null,
  },
  {
    id: 7,
    name: 'Onions (1kg)',
    category: 'Vegetables',
    price: 600,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80',
    description: 'Fresh red onions, a kitchen essential.',
    inStock: true,
    badge: null,
  },
  {
    id: 8,
    name: 'Catfish (Medium, 1pc)',
    category: 'Proteins',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&q=80',
    description: 'Fresh whole catfish, cleaned and ready for cooking.',
    inStock: false,
    badge: 'Out of Stock',
  },
];

export const categories = ['All', ...new Set(products.map(p => p.category))];

export const SUBSCRIPTION_PRICE = 5000; // NGN per month
export const SUBSCRIPTION_NAME = 'Monthly Fresh Basket';
export const SUBSCRIPTION_PERKS = [
  'Weekly delivery of curated fresh produce',
  '10% off all orders',
  'Priority customer support',
  'Free delivery every week',
];
