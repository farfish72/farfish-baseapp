"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useBaseAuth } from "@/app/contexts/BaseAuthContext";
import WalletConnection from "@/app/components/WalletConnection";

type ToastState = { type: "error" | "success"; message: string } | null;

const faqItems = [
  {
    question: "What is FarFISH?",
    answer: "FarFISH is a daily engagement platform on Base Network that rewards consistent on-chain activity. Connect your wallet, complete daily tasks, and earn rewards while building healthy crypto habits.",
  },
  {
    question: "How do I get started?",
    answer: "Connect your Base wallet and begin claiming daily rewards in the Chest section. The more consistent you are, the higher your rewards and streak bonuses.",
  },
  {
    question: "What features are available?",
    answer: "• Chest: Claim daily rewards and maintain your streak\n• Stake: Stake NFTs for bonus rewards\n• Steam: Trade and manage assets\n• Profile: View your stats and settings",
  },
  {
    question: "How does NFT staking work?",
    answer: "Mint or acquire FarFISH NFTs, then stake them to earn enhanced daily rewards. Different rarities (Common, Rare, Epic, Legendary) offer different reward multipliers. You can unstake anytime.",
  },
  {
    question: "Is my wallet secure?",
    answer: "Yes. FarFISH is fully non-custodial and built on Base Network. You maintain full control of your wallet and assets at all times. We never have access to your private keys.",
  },
  {
    question: "How are rewards calculated?",
    answer: "Base rewards are earned daily through consistent engagement. Staking NFTs provides bonus multipliers based on rarity tier and lock duration. All rewards are tracked transparently on-chain.",
  },
];

function ProfilePageContent() {
  const { user: baseUser } = useBaseAuth();

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
          {/* Profile Identity Section */}
          <section className="glass-card rounded-3xl">
            <div className="p-6">
              <div className="space-y-6">
                {/* Base App Identity Display */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/20">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/20 bg-white/10">
                    <Image
                      src="/pfp-optimized.webp"
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

                {/* Wallet Connection */}
                <WalletConnection />
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="glass-card rounded-3xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💡</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-white leading-tight">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-white/70 text-sm">Everything you need to know</p>
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
                        <span className="font-medium text-sm text-white pr-4">{faq.question}</span>
                        <div className={`
                          w-6 h-6 rounded-full bg-white/10 border border-white/20
                          flex items-center justify-center text-white/70 text-xs
                          transition-all duration-300 flex-shrink-0 ${open ? 'bg-white/20 text-white' : 'hover:bg-white/15'}
                        `}>
                          {open ? '−' : '+'}
                        </div>
                      </button>
                      {open && (
                        <div className="px-6 pb-4 text-sm text-white/80 leading-relaxed border-t border-white/10 pt-4 mt-2 whitespace-pre-line">
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
  return <ProfilePageContent />;
}