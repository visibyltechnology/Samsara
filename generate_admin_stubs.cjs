const fs = require('fs');
const path = require('path');

const components = [
  { name: 'AdminCategories', icon: 'Tag', title: 'Categories' },
  { name: 'AdminOrders', icon: 'ShoppingCart', title: 'Order Management' },
  { name: 'AdminUsers', icon: 'Users', title: 'User Management' },
  { name: 'AdminCoupons', icon: 'Ticket', title: 'Coupons & Discounts' },
  { name: 'AdminReviews', icon: 'Star', title: 'Product Reviews' },
  { name: 'AdminNewsletter', icon: 'Mail', title: 'Newsletter Subscribers' },
  { name: 'AdminDeliveryZones', icon: 'MapPin', title: 'Delivery Zones' },
  { name: 'AdminLoyalty', icon: 'Award', title: 'Loyalty Points System' },
  { name: 'AdminAbandonedCarts', icon: 'ShoppingBag', title: 'Abandoned Carts' },
  { name: 'AdminReferrals', icon: 'Share2', title: 'Referral Program' },
  { name: 'AdminSettings', icon: 'Settings', title: 'Store Settings' },
];

const dir = path.join(__dirname, 'src', 'pages', 'admin');

components.forEach(comp => {
  const filePath = path.join(dir, `${comp.name}.jsx`);
  if (!fs.existsSync(filePath)) {
    const content = `import React from 'react';
import { ${comp.icon} } from 'lucide-react';

export default function ${comp.name}() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <${comp.icon} className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">${comp.title}</h2>
      <p className="text-slate-500 text-sm max-w-md mx-auto">
        This module is currently under development. Check back soon for updates to the ${comp.title.toLowerCase()} system.
      </p>
    </div>
  );
}
`;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Created ${comp.name}.jsx`);
  }
});
