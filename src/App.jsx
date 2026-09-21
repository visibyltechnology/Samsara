import React from 'react';
import TopBanner from './components/TopBanner';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import './index.css';

function App() {
  return (
    <>
      <TopBanner />
      <Navbar />
      <main>
        <Hero />
      </main>
      <FloatingWhatsApp />
    </>
  );
}

export default App;
