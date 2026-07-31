"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (r) => {
    setRole(r);
    if (r === "admin") {
      setEmail("admin@campus.edu");
      setPassword("x7Q@m#9Lp$2Bv&W");
    } else {
      setEmail("student@campus.edu");
      setPassword("x7Q@m#9Lp$2Bv&W");
    }
    setError("");
  };

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-bg-decor">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      <div className="login-container">
        {/* Left branding panel */}
        <div className="login-brand">
          <div className="login-brand-content">
            <span className="login-logo-icon">🔍</span>
            <h1>
              Campus<span className="accent">Retriever</span>
            </h1>
            <p>The official campus hub for lost belongings and found treasures.</p>

            <div className="login-features">
              <div className="login-feature">
                <span>📝</span>
                <div>
                  <strong>Report Items</strong>
                  <small>Quickly report lost or found items</small>
                </div>
              </div>
              <div className="login-feature">
                <span>🔍</span>
                <div>
                  <strong>Smart Search</strong>
                  <small>Find items by name, location, or category</small>
                </div>
              </div>
              <div className="login-feature">
                <span>🔒</span>
                <div>
                  <strong>Secure Tracking</strong>
                  <small>Full audit trail for all items</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right login form */}
        <div className="login-form-panel">
          <div className="login-form-content">
            <h2>Welcome Back</h2>
            <p className="login-subtitle">Sign in to continue to your dashboard</p>

            {/* Role toggle */}
            <div className="login-role-toggle">
              <button
                className={`login-role-btn${role === "student" ? " active" : ""}`}
                onClick={() => fillDemo("student")}
                type="button"
              >
                🎓 Student
              </button>
              <button
                className={`login-role-btn${role === "admin" ? " active" : ""}`}
                onClick={() => fillDemo("admin")}
                type="button"
              >
                🛡️ Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="login-error">
                  <span>⚠️</span> {error}
                </div>
              )}

              <div className="login-field">
                <label htmlFor="email">Email Address</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">📧</span>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@campus.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password">Password</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">🔒</span>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner" /> Signing in...
                  </>
                ) : (
                  <>🚀 Sign In</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
