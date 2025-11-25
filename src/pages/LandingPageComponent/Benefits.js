import React from "react";
import './Benefits.css';

const benefits = [
  {
    icon: '🌱',
    title: '100% Organic',
    desc: 'All our produce is certified organic and pesticide-free.'
  },
  {
    icon: '🚚',
    title: 'Fresh Daily',
    desc: 'Farm-fresh products delivered daily from local farms.'
  },
  {
    icon: '🏪',
    title: 'Local Sourced',
    desc: 'Supporting local farmers and sustainable agriculture.'
  }
];

const Benefits = () => (
  <section className="benefits-section">
    <h2 className="benefits-title">Why Choose The Farmers Store?</h2>
    <div className="benefits-list">
      {benefits.map((b, idx) => (
        <div className="benefit-item" key={idx}>
          <div className="benefit-icon">{b.icon}</div>
          <div className="benefit-title">{b.title}</div>
          <div className="benefit-desc">{b.desc}</div>
        </div>
      ))}
    </div>
  </section>
);

export default Benefits;
