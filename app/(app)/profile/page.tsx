"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useCallback, Suspense } from "react";
import BaseAuthGuard from "@/app/components/BaseAuthGuard";
import { useBaseAuth } from "@/app/contexts/BaseAuthContext";

type ToastState = { type: "error" | "success"; message: string } | null;

const faqItems = [
  {
    question: "1. What is FarFISH?",
    answer: "FarFISH is a daily habit-building app on Base that rewards consistent on-chain activity. Connect your wallet, complete tasks, and earn rewards.",
  },
  {
    question: "2. How do I earn rewards?",
    answer: "Claim daily rewards in Chest, stake NFTs for bonus rewards, and maintain consistent on-chain activity.",
  },
  {
    question: "3. What are the main features?",
    answer: "Chest (daily rewards), Stake (NFT staking), and Profile (your stats and identity).",
  },
  {
    question: "4. How does staking work?",
    answer: "Mint or buy FarFISH NFTs, then stake them to earn higher daily rewards and unlock premium features. Unstake anytime.",
  },
  {
    question: "5. Is my data secure?",
    answer: "Yes. FarFISH is non-custodial and built on Base blockchain. You control your wallet and assets at all times.",
  },
  {
    question: "6. How does the app work?",
    answer: "All rewards and progress are tracked on-chain on Base. Your wallet is your identity and holds all your assets.",
  },
];

function ProfilePageContent() {
  const { user: baseUser, signOut } = useBaseAuth();

  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <main className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex flex-col gap-6">
          {/* Base App Profile Identity Section */}
          <section className="glass-card rounded-3xl">
            <div className="p-6">
              <div className="space-y-6">
                {/* Base App Identity Display */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/20">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/20 bg-white/10">
                    <Image
                      src="/pfp.png"
                      alt="Profile Avatar"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">
                      @{baseUser?.username || 'baseuser'}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">FID: {baseUser?.fid}</p>
                  </div>
                </div>

                {/* Connection Status and Disconnect */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm text-white/70">Connected to Base App</span>
                  </div>
                  <button
                    onClick={signOut}
                    className="py-2 px-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 font-semibold text-sm transition-all duration-300 hover:bg-red-500/30 cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* App Features Section */}
          <section className="glass-card rounded-3xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎮</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-white leading-tight">
                    FarFISH Features
                  </h2>
                  <p className="text-white/70 text-sm">Explore what you can do</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🏆</span>
                    <h3 className="text-white font-bold">Daily Chest</h3>
                  </div>
                  <p className="text-white/70 text-sm">Claim daily rewards and build your streak</p>
                </div>
                
                <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🔒</span>
                    <h3 className="text-white font-bold">NFT Staking</h3>
                  </div>
                  <p className="text-white/70 text-sm">Stake your FarFISH NFTs to earn bonus rewards</p>
                </div>
                
                <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🌊</span>
                    <h3 className="text-white font-bold">Steam Trading</h3>
                  </div>
                  <p className="text-white/70 text-sm">Trade and manage your on-chain assets</p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="glass-card rounded-3xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">❓</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-white leading-tight">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-white/70 text-sm">Learn about FarFISH features</p>
                </div>
              </div>

              <div className="space-y-3">
                {faqItems.map((faq, idx) => {
                  const open = openIdx === idx;
                  return (
                    <div
                      key={faq.question}
                      className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition-all duration-300"
                    >
                      <button
                        className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
                        onClick={() => setOpenIdx(open ? null : idx)}
                      >
                        <span className="font-medium text-sm text-white">{faq.question}</span>
                        <div className={`
                          w-6 h-6 rounded-full bg-white/10 border border-white/20
                          flex items-center justify-center text-white/70 text-xs
                          transition-all duration-300 ${open ? 'bg-white/20 text-white' : 'hover:bg-white/15'}
                        `}>
                          {open ? '−' : '+'}
                        </div>
                      </button>
                      {open && (
                        <div className="px-6 pb-4 text-sm text-white/80 leading-relaxed border-t border-white/10 pt-4 mt-2">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-md">
          <div
            className={`rounded-2xl border px-6 py-4 text-sm shadow-medium backdrop-blur-md ${
              toast.type === "success"
                ? "border-white/40 bg-white/20 text-white"
                : "border-white/40 bg-white/20 text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {toast.type === "success" ? "✅" : "❌"}
              </span>
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <BaseAuthGuard>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-white/10 animate-pulse"></div>
                <div className="w-32 h-4 mx-auto rounded bg-white/10 animate-pulse"></div>
              </div>
            </div>
          </div>
        }
      >
        <ProfilePageContent />
      </Suspense>
    </BaseAuthGuard>
  );
}