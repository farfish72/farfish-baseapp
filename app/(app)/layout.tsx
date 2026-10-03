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
      {children}
      <Footer />
      <BottomNav />
    </ToastProvider>
  );
}