import { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-40 h-10 rounded-xl bg-white/10 animate-pulse" />
        </div>
      }
    >
      <HomeClient />
    </Suspense>
  );
}