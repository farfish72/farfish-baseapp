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
      {children}
      <Footer />
      <BottomNav />
    </ToastProvider>
  );
}