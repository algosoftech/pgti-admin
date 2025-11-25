import React from "react";
import './PricingPlans.css';

const plans = [
  {
    name: "Basic",
    price: "Free",
    features: [
      "Browse all products",
      "Standard delivery",
      "Email support",
      "Basic rewards"
    ],
    highlight: false
  },
  {
    name: "Premium",
    price: "$19/mo",
    features: [
      "Free delivery on orders $50+",
      "Priority customer support",
      "Exclusive products",
      "Double rewards points",
      "Early access to sales"
    ],
    highlight: true
  },
  {
    name: "Family",
    price: "$39/mo",
    features: [
      "Free delivery on all orders",
      "Dedicated account manager",
      "Custom meal planning",
      "Bulk order discounts",
      "Family meal bundles"
    ],
    highlight: false
  }
];

const PricingPlans = () => (
  <section className="pricing-section">
    <h2 className="pricing-title">Pricing Plans</h2>
    <div className="pricing-cards">
      {plans.map((plan, idx) => (
        <div className={`pricing-card${plan.highlight ? ' highlight' : ''}`} key={idx}>
          <h3 className="plan-name">{plan.name}</h3>
          <div className="plan-price">{plan.price}</div>
          <ul className="plan-features">
            {plan.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
          <button className="plan-cta">{plan.price === "Free" ? "Start Shopping" : "Choose Plan"}</button>
        </div>
      ))}
    </div>
  </section>
);

export default PricingPlans;
