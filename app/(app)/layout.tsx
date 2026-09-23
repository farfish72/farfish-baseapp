import { BottomNav } from "@/app/components/BottomNav";
import Footer from "@/app/components/Footer";
import { ToastProvider } from "@/app/providers/ToastProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      {/* Page content with content-driven padding */}
      <div style={{ paddingBottom: "var(--content-bottom-padding)" }}>
        {children}
      </div>

      {/* Footer */}
      <Footer />

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </ToastProvider>
  );
}