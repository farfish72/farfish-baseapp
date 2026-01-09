import { BottomNav } from "@/app/components/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Page content */}
      <div style={{ paddingBottom: "64px" }}>
        {children}
      </div>

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </>
  );
}