import React from "react";
import './SampleProfiles.css';

const profiles = [
  {
    name: "Organic Carrots",
    category: "Vegetables",
    followers: "Fresh Daily",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "Artisan Bread",
    category: "Bakery",
    followers: "Handmade",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "Local Honey",
    category: "Pantry",
    followers: "Raw & Pure",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=300&q=80"
  }
];

const SampleProfiles = () => (
  <section className="sample-profiles-section">
    <h2 className="sp-title">Featured Products</h2>
    <div className="sp-cards">
      {profiles.map((p, idx) => (
        <div className="sp-card" key={idx}>
          <img src={p.image} alt={p.name} className="sp-img" />
          <div className="sp-info">
            <div className="sp-name">{p.name}</div>
            <div className="sp-category">{p.category}</div>
            <div className="sp-followers">{p.followers}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default SampleProfiles;
