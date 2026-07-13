import React from "react";
import "styles/admin-pages.css";

export default function ListSortFilter({
  value = {},
  onChange,
  options = [],
  defaultLabel = "Default sorting",
}) {
  const sortBy = value.sort_by || "";
  const order = value.order || "asc";

  const update = (patch) => {
    onChange?.({
      sort_by: sortBy,
      order,
      ...patch,
    });
  };

  return (
    <div className="listing-sort-toolbar">
      <div className="listing-sort-field">
        <label>Sort By</label>
        <select value={sortBy} onChange={(event) => update({ sort_by: event.target.value })}>
          <option value="">{defaultLabel}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="listing-sort-field">
        <label>Order</label>
        <select value={order} onChange={(event) => update({ order: event.target.value })} disabled={!sortBy}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>
  );
}
