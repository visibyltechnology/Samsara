import React from 'react';
import { Star } from 'lucide-react';

export default function AdminReviews() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Star className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Product Reviews</h2>
      <p className="text-slate-500 text-sm max-w-md mx-auto">
        This module is currently under development. Check back soon for updates to the product reviews system.
      </p>
    </div>
  );
}
