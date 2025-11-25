import React from "react";
import './HowItWorks.css';

const steps = [
  {
    icon: '🛒',
    title: 'Browse Our Store',
    desc: 'Explore our wide selection of fresh organic produce and artisanal products.'
  },
  {
    icon: '📱',
    title: 'Order Online',
    desc: 'Place your order through our easy-to-use online platform or mobile app.'
  },
  {
    icon: '🚚',
    title: 'Fast Delivery',
    desc: 'Get your fresh groceries delivered to your doorstep within hours.'
  },
  {
    icon: '😋',
    title: 'Enjoy Fresh Food',
    desc: 'Savor the taste of farm-fresh, organic produce in every meal.'
  }
];

const HowItWorks = () => (
  <section className="how-it-works-section">
    <h2 className="hiw-title">How It Works</h2>
    <div className="hiw-steps">
      {steps.map((step, idx) => (
        <div className="hiw-step" key={idx}>
          <div className="hiw-icon">{step.icon}</div>
          <h3 className="hiw-step-title">{step.title}</h3>
          <p className="hiw-step-desc">{step.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default HowItWorks;
