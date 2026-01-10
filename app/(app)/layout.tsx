import { BottomNav } from "@/app/components/BottomNav";
import Footer from "@/app/components/Footer";
import { ToastProvider } from "@/app/(app)/home/providers/ToastProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      {/* Page content with optimized padding */}
      <div style={{ paddingBottom: "140px" }}>
        {children}
      </div>

      {/* Footer */}
      <Footer />

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </ToastProvider>
  );
}