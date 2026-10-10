import BottomNav from "@/app/components/BottomNav";
import Footer from "@/app/components/Footer";
import AutoBindReferral from "@/app/components/AutoBindReferral";
import { ToastProvider } from "@/app/providers/ToastProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AutoBindReferral />
      <div style={{ paddingBottom: 'calc(var(--bottom-nav-height) + 0.75rem)' }}>
        {children}
        <Footer />
      </div>
      <BottomNav />
    </ToastProvider>
  );
}