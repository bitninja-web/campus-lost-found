"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSession } from "next-auth/react";

const ItemsContext = createContext();

const API = "/api/items";

// Helper to get item ID (works for both MongoDB _id and legacy id)
function getItemId(item) {
  return item.id || item._id;
}

export function ItemsProvider({ children }) {
  const { status } = useSession();
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortMode, setSortMode] = useState("newest");
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
  const toastTimers = useRef(new Map());

  // ── Load items only when authenticated ──
  useEffect(() => {
    if (status === "authenticated") {
      loadItems();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  async function loadItems() {
    setLoading(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setAllItems(data);
    } catch {
      addToast("Failed to load items. Is the server running?", "error");
    } finally {
      setLoading(false);
    }
  }

  // ── Toast system ──
  // Clean up all pending toast timers on unmount
  useEffect(() => {
    const timers = toastTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const addToast = useCallback((msg, type = "success") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, msg, type }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      toastTimers.current.delete(id);
    }, 3500);
    toastTimers.current.set(id, timer);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
  }, []);

  // ── CRUD operations ──
  const claimItem = useCallback(
    async (id) => {
      try {
        const res = await fetch(`${API}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Claimed" }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Update failed");
        }
        const updated = await res.json();
        setAllItems((prev) =>
          prev.map((i) => (getItemId(i) === id ? updated : i))
        );
        addToast("Item marked as claimed! 🎉", "success");
      } catch (err) {
        addToast(err.message || "Could not update item.", "error");
      }
    },
    [addToast]
  );

  const deleteItem = useCallback(
    async (id) => {
      try {
        const res = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Delete failed");
        }
        setAllItems((prev) => prev.filter((i) => getItemId(i) !== id));
        addToast("Item removed.", "info");
      } catch (err) {
        addToast(err.message || "Delete failed.", "error");
      }
    },
    [addToast]
  );

  const createItem = useCallback(
    async (formData) => {
      const res = await fetch(API, { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }
      const saved = await res.json();
      setAllItems((prev) => [saved, ...prev]);
      addToast("Report posted successfully! ✅", "success");
      return saved;
    },
    [addToast]
  );

  // ── Filtering + Sorting ──
  const getFilteredItems = useCallback(() => {
    const q = searchQuery.toLowerCase().trim();

    let filtered = allItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q);

      const matchesCat = !filterCategory || item.category === filterCategory;
      const matchesStatus = !activeStatus || item.status === activeStatus;
      return matchesSearch && matchesCat && matchesStatus;
    });

    // Sort
    const arr = [...filtered];
    switch (sortMode) {
      case "newest":
        return arr.sort((a, b) => new Date(b.date) - new Date(a.date));
      case "oldest":
        return arr.sort((a, b) => new Date(a.date) - new Date(b.date));
      case "az":
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case "za":
        return arr.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return arr;
    }
  }, [allItems, searchQuery, filterCategory, activeStatus, sortMode]);

  // ── Stats (memoized — only recalculated when allItems changes) ──
  const stats = useMemo(() => ({
    total: allItems.length,
    lost: allItems.filter((i) => i.status === "Lost").length,
    found: allItems.filter((i) => i.status === "Found").length,
    claimed: allItems.filter((i) => i.status === "Claimed").length,
  }), [allItems]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setFilterCategory("");
    setSortMode("newest");
    setActiveStatus("");
  }, []);

  return (
    <ItemsContext.Provider
      value={{
        allItems,
        loading,
        stats,
        activeStatus,
        setActiveStatus,
        searchQuery,
        setSearchQuery,
        filterCategory,
        setFilterCategory,
        sortMode,
        setSortMode,
        getFilteredItems,
        resetFilters,
        claimItem,
        deleteItem,
        createItem,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
}

export function useItems() {
  const ctx = useContext(ItemsContext);
  if (!ctx) throw new Error("useItems must be used within ItemsProvider");
  return ctx;
}
