import React from 'react';
import TopBanner from './components/TopBanner';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Shop from './pages/Shop';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import { CartProvider } from './context/CartContext';
import './index.css';

// Simple hash-based routing
const getPage = () => {
  const path = window.location.pathname;
  if (path === '/shop') return 'shop';
  return 'home';
};

function App() {
  const page = getPage();

  return (
    <CartProvider>
      <TopBanner />
      <Navbar />
      <main>
        {page === 'home' && <Hero />}
        {page === 'shop' && <Shop />}
      </main>
      <FloatingWhatsApp />
    </CartProvider>
  );
}

export default App;
