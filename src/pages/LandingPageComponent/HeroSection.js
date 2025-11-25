import React from "react";
import './HeroSection.css';

const HeroSection = () => (
  <section className="hero-section">
    <div className="hero-content">
      <h1 className="hero-headline">Fresh • Organic • Real</h1>
      <p className="hero-subheadline">Experience the finest selection of locally sourced, organic produce and artisanal products at The Farmers Store.</p>
      <a href="#lead-capture" className="hero-cta">Shop Now</a>
    </div>
    <div className="hero-image">
      <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" alt="Fresh organic produce at The Farmers Store" />
    </div>
  </section>
);

export default HeroSection;
