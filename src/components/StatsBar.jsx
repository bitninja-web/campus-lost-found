"use client";

export default function StatsBar({ stats }) {
  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-num">{stats.total}</span>
        <span className="stat-label">Total</span>
      </div>
      <div className="stat">
        <span className="stat-num stat-lost">{stats.lost}</span>
        <span className="stat-label">Lost</span>
      </div>
      <div className="stat">
        <span className="stat-num stat-found">{stats.found}</span>
        <span className="stat-label">Found</span>
      </div>
      <div className="stat">
        <span className="stat-num stat-claimed">{stats.claimed}</span>
        <span className="stat-label">Claimed</span>
      </div>
    </div>
  );
}
