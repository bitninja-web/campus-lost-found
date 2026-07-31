"use client";
import { useEffect, useRef } from "react";
import { useItems } from "@/context/ItemsContext";

export default function SearchBar() {
  const { searchQuery, setSearchQuery, filterCategory, setFilterCategory } =
    useItems();
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search
  function handleSearch(e) {
    const val = e.target.value;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSearchQuery(val);
    }, 220);
  }

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  // Keep input in sync when filters are reset externally
  useEffect(() => {
    if (inputRef.current && searchQuery === "") {
      inputRef.current.value = "";
    }
  }, [searchQuery]);

  return (
    <div className="search-wrapper">
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search items, locations, descriptions..."
          autoComplete="off"
          defaultValue={searchQuery}
          onChange={handleSearch}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Accessories">Accessories</option>
          <option value="Books">Books</option>
          <option value="IDs & Cards">IDs &amp; Cards</option>
          <option value="Clothing">Clothing</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );
}
