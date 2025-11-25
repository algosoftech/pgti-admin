import React, { useState } from "react";
import './SearchPreview.css';

const demoResults = [
  { name: "Organic Tomatoes", category: "Vegetables", price: "$4.99/lb" },
  { name: "Fresh Basil", category: "Herbs", price: "$2.99/bunch" },
  { name: "Free-Range Eggs", category: "Dairy", price: "$6.99/dozen" }
];

const SearchPreview = () => {
  const [query, setQuery] = useState("");
  const filtered = demoResults.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.category.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <section className="search-preview-section">
      <h2 className="sprev-title">Search Our Fresh Products</h2>
      <div className="sprev-bar-wrap">
        <input
          className="sprev-bar"
          type="text"
          placeholder="Search for fresh produce, organic goods..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div className="sprev-demo-results">
        {filtered.length ? filtered.map((r, idx) => (
          <div className="sprev-result" key={idx}>
            <div className="sprev-name">{r.name}</div>
            <div className="sprev-cat">{r.category}</div>
            <div className="sprev-fol">{r.price}</div>
          </div>
        )) : <div className="sprev-no">No products found.</div>}
      </div>
    </section>
  );
};

export default SearchPreview;
