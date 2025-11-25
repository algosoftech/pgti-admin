import React from "react";
import './FinalCTAAndFooter.css';

const FinalCTAAndFooter = () => (
  <footer className="footer-section">
    <div className="footer-cta">
      <h2>Ready to experience the freshest, most delicious organic produce?</h2>
      <a href="#lead-capture" className="footer-cta-btn">Start Shopping Now</a>
    </div>
    <div className="footer-links">
      <a href="#how-it-works">How It Works</a>
      <a href="#pricing">Membership</a>
      <a href="#faq">FAQ</a>
      <a href="mailto:contact@farmersstore.com">Contact Us</a>
    </div>
    <div className="footer-info">
      &copy; {new Date().getFullYear()} The Farmers Store. All rights reserved.
    </div>
  </footer>
);

export default FinalCTAAndFooter;
