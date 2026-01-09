"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

export default function Home() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();
  const router = useRouter();

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    } else {
      router.replace("/home");
    }
  }, [setMiniAppReady, isMiniAppReady, router]);

  return null;
}
