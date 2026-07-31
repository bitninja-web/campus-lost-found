"use client";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar({ onOpenModal }) {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();

  const role = session?.user?.role;
  const userName = session?.user?.name;
  const isAdmin = role === "admin";

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <a
          href="#"
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="logo-icon">🔍</span>
          Campus<span className="accent">Retriever</span>
        </a>
        <div className="nav-actions">
          {/* User info */}
          {session && (
            <div className="nav-user">
              <span className={`nav-role-badge ${isAdmin ? "admin" : "student"}`}>
                {isAdmin ? "🛡️ Admin" : "🎓 Student"}
              </span>
              <span className="nav-user-name">{userName}</span>
            </div>
          )}

          <button
            className="theme-toggle"
            title="Toggle dark mode"
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
          >
            <span className="theme-icon">
              {theme === "dark" ? "☀️" : "🌙"}
            </span>
          </button>

          <button className="btn btn-primary" onClick={onOpenModal}>
            <span>+</span> Report Item
          </button>

          {session && (
            <button
              className="btn btn-secondary nav-logout"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
