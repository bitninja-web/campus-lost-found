"use client";
import StatsBar from "./StatsBar";
import SearchBar from "./SearchBar";
import { useItems } from "@/context/ItemsContext";

export default function Hero() {
  const { stats } = useItems();

  return (
    <header className="hero">
      {/* Floating particles */}
      <div className="hero-particles">
        <span className="particle" />
        <span className="particle" />
        <span className="particle" />
        <span className="particle" />
        <span className="particle" />
        <span className="particle" />
        <span className="particle" />
        <span className="particle" />
      </div>

      <div className="container">
        <div className="hero-badge">🏫 Campus Portal</div>
        <h1>
          Lost something?
          <br />
          <span className="accent">Let&apos;s get it back.</span>
        </h1>
        <p className="hero-sub">
          The official campus hub for lost belongings and found treasures.
        </p>
        <StatsBar stats={stats} />
        <SearchBar />
      </div>
    </header>
  );
}
