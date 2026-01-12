"use client";
import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function FarcasterMiniAppReady() {
  useEffect(() => {
    try {
      sdk.actions.ready();
      console.log("Farcaster mini app ready signal sent");
    } catch (error) {
      console.warn("Failed to send ready signal to Farcaster:", error);
    }
  }, []);

  return null;
}