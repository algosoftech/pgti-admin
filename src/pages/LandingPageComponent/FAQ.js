import React, { useState } from "react";
import './FAQ.css';

const faqs = [
  {
    q: "Are all products organic?",
    a: "Yes, all our produce is certified organic and pesticide-free. We work directly with local organic farms."
  },
  {
    q: "How fresh are the products?",
    a: "We deliver farm-fresh products daily. Most items are harvested within 24-48 hours of delivery."
  },
  {
    q: "What are your delivery areas?",
    a: "We currently deliver within a 25-mile radius of our store. Check our delivery map for specific coverage areas."
  },
  {
    q: "Can I customize my order?",
    a: "Absolutely! You can customize your orders, set up recurring deliveries, and even request specific products from our partner farms."
  }
];

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <section className="faq-section">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqs.map((item, idx) => (
          <div className="faq-item" key={idx}>
            <button className="faq-question" onClick={() => setOpenIdx(openIdx === idx ? null : idx)}>
              {item.q}
              <span className="faq-toggle">{openIdx === idx ? '-' : '+'}</span>
            </button>
            {openIdx === idx && <div className="faq-answer">{item.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
