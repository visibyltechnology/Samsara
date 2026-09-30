import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchShopData = async () => {
      setLoading(true);
      
      // Fetch categories for sidebar/filter
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      setCategories(cats || []);

      let query = supabase.from('products').select('*, categories(name)').eq('is_active', true);
      
      if (categorySlug) {
        // Find category id based on slug to filter
        const category = cats?.find(c => c.slug === categorySlug);
        if (category) {
          query = query.eq('category_id', category.id);
          setActiveCategory(category);
        }
      } else {
        setActiveCategory(null);
      }

      const { data: prods } = await query.order('created_at', { ascending: false });
      setProducts(prods || []);
      setLoading(false);
    };

    fetchShopData();
  }, [categorySlug]);

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Categories */}
        <aside className="w-full md:w-1/4 shrink-0">
          <div className="bg-card rounded-lg border p-4 sticky top-20">
            <h3 className="font-display font-bold text-lg mb-4">Categories</h3>
            <div className="flex flex-col gap-2">
              <a 
                href="/shop" 
                className={`text-sm px-3 py-2 rounded-md transition-colors ${!categorySlug ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
              >
                All Products
              </a>
              {categories.map(cat => (
                <a
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className={`text-sm px-3 py-2 rounded-md transition-colors ${categorySlug === cat.slug ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-display font-bold">
              {activeCategory ? activeCategory.name : 'All Products'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Showing {products.length} {products.length === 1 ? 'result' : 'results'}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
              <h3 className="text-lg font-medium text-foreground">No products found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try selecting a different category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
