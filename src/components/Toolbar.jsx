"use client";
import { useItems } from "@/context/ItemsContext";

const TABS = [
  { label: "🗂️ All", status: "" },
  { label: "🔴 Lost", status: "Lost" },
  { label: "🟢 Found", status: "Found" },
  { label: "✅ Claimed", status: "Claimed" },
];

export default function Toolbar() {
  const { activeStatus, setActiveStatus, sortMode, setSortMode } = useItems();

  return (
    <div className="toolbar">
      <div className="status-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.status}
            className={`tab-btn${activeStatus === tab.status ? " active" : ""}`}
            onClick={() => setActiveStatus(tab.status)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="sort-wrap">
        <label htmlFor="sortSelect">Sort:</label>
        <select
          id="sortSelect"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
        </select>
      </div>
    </div>
  );
}
