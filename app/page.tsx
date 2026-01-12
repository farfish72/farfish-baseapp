"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

export default function Entry() {
  const router = useRouter();
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }

    router.replace("/home");
  }, [isMiniAppReady, setMiniAppReady, router]);

  return null;
}