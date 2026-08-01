"use client";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow" />

      <div className="footer-main">
        <div className="container footer-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <a
              href="#"
              className="footer-logo"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <span className="footer-logo-icon">🔍</span>
              Campus<span className="accent">Retriever</span>
            </a>
            <p className="footer-tagline">
              The official campus platform for reporting and recovering lost
              belongings. Helping students reconnect with what matters most.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a href="/">🏠 Home</a>
              </li>
              <li>
                <a href="/">📊 Dashboard</a>
              </li>
            </ul>
          </div>

          {/* Contact & Info */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-links footer-contact-list">
              <li>
                <span className="footer-contact-icon">📍</span>
                <span>Student Affairs Office, Block A</span>
              </li>
              <li>
                <span className="footer-contact-icon">📞</span>
                <span>+91 98765 43210</span>
              </li>
              <li>
                <span className="footer-contact-icon">📧</span>
                <span>lostandfound@campus.edu</span>
              </li>
              <li>
                <span className="footer-contact-icon">🕐</span>
                <span>Mon — Sat, 9 AM — 5 PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            &copy; 2026 Campus<span className="accent">Retriever</span> &mdash;
            Built with ❤️ for the campus community
          </p>
        </div>
      </div>
    </footer>
  );
}
