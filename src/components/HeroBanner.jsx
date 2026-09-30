import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── HERO / BANNER COMPONENT ─────────────────────────────────────────────────
const HeroBanner = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value');
      if (!data) return;

      const s = {};
      data.forEach(row => { try { s[row.key] = JSON.parse(row.value); } catch(e) { s[row.key] = row.value; } });

      const bannerSlides = [s.banner_slide_1, s.banner_slide_2, s.banner_slide_3, s.banner_slide_4]
        .filter(Boolean);
      setSlides(bannerSlides);
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides]);

  const prev = () => setCurrentSlide(p => (p - 1 + slides.length) % slides.length);
  const next = () => setCurrentSlide(p => (p + 1) % slides.length);

  // No banner images — show default hero
  if (!slides.length) {
    return (
      <section
        className="relative w-full overflow-hidden py-16 md:py-24"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--accent)) 50%, hsl(var(--background)) 100%)',
        }}
      >
        <div className="container text-center py-20 px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight"
          >
            Fresh Groceries,<br />
            <span className="text-primary">Delivered Daily</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-muted-foreground text-lg max-w-md mx-auto"
          >
            Premium quality groceries at the best prices. Shop from the comfort of your home.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-11 mt-6 rounded-full px-8"
            >
              Shop Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  // Banner image carousel
  return (
    <section className="relative w-full overflow-hidden" style={{ aspectRatio: '16/5', minHeight: 220, maxHeight: 520 }}>
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSlide}
          src={slides[currentSlide]}
          alt={`Banner ${currentSlide + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${i === currentSlide ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/75'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroBanner;
