import React, { useState } from "react";
import './LeadCapture.css';

const LeadCapture = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: handle email submission logic here
    setSubmitted(true);
  };

  return (
    <section className="lead-capture-section" id="lead-capture">
      <h2 className="lc-title">Stay Updated with Fresh Deals</h2>
      <p className="lc-desc">Subscribe to our newsletter and get exclusive offers, new product alerts, and seasonal specials delivered to your inbox.</p>
      {submitted ? (
        <div className="lc-success">Thank you! You'll receive our latest updates and exclusive offers.</div>
      ) : (
        <form className="lc-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="lc-input"
            placeholder="Enter your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button className="lc-btn" type="submit">Subscribe Now</button>
        </form>
      )}
    </section>
  );
};

export default LeadCapture;
