import { ThemeProvider } from "@/context/ThemeContext";
import { ItemsProvider } from "@/context/ItemsContext";
import AuthProvider from "@/context/AuthContext";
import "./styles/variables.css";
import "./styles/base.css";
import "./styles/navbar.css";
import "./styles/buttons.css";
import "./styles/hero.css";
import "./styles/cards.css";
import "./styles/detail.css";
import "./styles/forms.css";
import "./styles/toast.css";
import "./styles/error-responsive.css";
import "./styles/login.css";
import "./styles/audit.css";
import "./styles/footer.css";

export const metadata = {
  title: "Campus Retriever | Lost & Found",
  description:
    "Campus Lost and Found portal — report, search, and recover lost items on campus. The official hub for students to reconnect with their belongings.",
  keywords: ["lost and found", "campus", "university", "lost items", "found items"],
  authors: [{ name: "Campus Retriever" }],
  openGraph: {
    title: "Campus Retriever | Lost & Found",
    description: "The official campus hub for lost belongings and found treasures.",
    type: "website",
    locale: "en_IN",
    siteName: "Campus Retriever",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Retriever | Lost & Found",
    description: "Report and find lost items on campus.",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔍</text></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <ItemsProvider>{children}</ItemsProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
