import { BottomNav } from "@/app/components/BottomNav";
import Footer from "@/app/components/Footer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Page content with padding for footer and nav */}
      <div style={{ paddingBottom: "120px" }}>
        {children}
      </div>

      {/* Footer */}
      <Footer />

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </>
  );
}