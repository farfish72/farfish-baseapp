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
      <div style={{ paddingBottom: 'calc(var(--bottom-nav-height) + 1.5rem)' }}>
        {children}
      </div>
      <Footer />
      <BottomNav />
    </ToastProvider>
  );
}