import React from "react";
import './SocialProof.css';

const testimonials = [
  {
    name: "Sarah M.",
    text: "The freshest produce I've ever had delivered! The organic vegetables taste amazing and last so much longer than store-bought.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    name: "David L.",
    text: "Love supporting local farmers while getting the best quality food. The delivery is always on time and everything is perfectly fresh.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  }
];

const logos = [
  "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=100&q=80"
];

const SocialProof = () => (
  <section className="social-proof-section">
    <h2 className="sp-title">Trusted by Local Families</h2>
    <div className="sp-logos">
      {logos.map((logo, idx) => (
        <img src={logo} alt="farm logo" key={idx} className="sp-logo" />
      ))}
    </div>
    <div className="sp-testimonials">
      {testimonials.map((t, idx) => (
        <div className="sp-testimonial" key={idx}>
          <img src={t.avatar} alt={t.name} className="sp-avatar" />
          <p className="sp-text">"{t.text}"</p>
          <div className="sp-name">{t.name}</div>
        </div>
      ))}
    </div>
    <div className="sp-badges">
      <span className="sp-badge">✔ Organic Certified</span>
      <span className="sp-badge">★ 5-Star Reviews</span>
      <span className="sp-badge">🌱 Local Sourced</span>
    </div>
  </section>
);

export default SocialProof;
