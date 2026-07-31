"use client";
import { useMemo } from "react";
import { useItems } from "@/context/ItemsContext";
import ItemCard from "./ItemCard";

export default function ItemsGrid({ onDetail, isAdmin }) {
  const {
    getFilteredItems,
    claimItem,
    deleteItem,
    loading,
    resetFilters,
    addToast,
  } = useItems();

  const filteredItems = useMemo(() => getFilteredItems(), [getFilteredItems]);

  if (loading) return null;

  if (filteredItems.length === 0) {
    return (
      <div className="no-results">
        <div className="no-results-icon">😔</div>
        <p>No items found matching your search.</p>
        <button className="btn btn-secondary" onClick={resetFilters}>
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="items-grid">
      {filteredItems.map((item, index) => (
        <ItemCard
          key={item.id || item._id}
          item={item}
          index={index}
          isAdmin={isAdmin}
          onClaim={claimItem}
          onDelete={deleteItem}
          onDetail={onDetail}
          addToast={addToast}
        />
      ))}
    </div>
  );
}
