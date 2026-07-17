"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ConfirmProvider } from "@/components/ConfirmDialog";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Toolbar from "@/components/Toolbar";
import ItemsGrid from "@/components/ItemsGrid";
import DetailView from "@/components/DetailView";
import ReportModal from "@/components/ReportModal";
import Toast from "@/components/Toast";
import ScrollToTop from "@/components/ScrollToTop";
import SkeletonLoader from "@/components/SkeletonLoader";
import Footer from "@/components/Footer";
import { useItems } from "@/context/ItemsContext";

export default function HomePage() {
  const { data: session } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const { loading } = useItems();

  const role = session?.user?.role || "student";
  const isAdmin = role === "admin";

  return (
    <ErrorBoundary>
      <ConfirmProvider>
        <Navbar onOpenModal={() => setModalOpen(true)} />
        <Hero />

        {loading ? (
          <SkeletonLoader />
        ) : (
          <main className="container">
            {detailItem && (
              <DetailView
                item={detailItem}
                onClose={() => setDetailItem(null)}
                isAdmin={isAdmin}
              />
            )}
            <Toolbar />
            <ItemsGrid
              onDetail={(item) => setDetailItem(item)}
              isAdmin={isAdmin}
            />
          </main>
        )}

        <ReportModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        <Toast />
        <ScrollToTop />
        <Footer />
      </ConfirmProvider>
    </ErrorBoundary>
  );
}
