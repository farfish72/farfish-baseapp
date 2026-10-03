"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useBaseAuth } from "@/app/contexts/BaseAuthContext";
import WalletConnection from "@/app/components/WalletConnection";

type ToastState = { type: "error" | "success"; message: string } | null;

const faqItems = [
  {
    question: "What is FarFISH?",
    answer: "FarFISH is a daily habit-building app on Base that rewards consistent on-chain activity. Connect your wallet, complete tasks, and accumulate tokens before launch.",
  },
  {
    question: "How do I earn tokens?",
    answer: "Claim daily rewards in Chest, complete social tasks in Steam, lock NFTs for bonus yield, and refer friends to earn per referral.",
  },
  {
    question: "What are the main features?",
    answer: "Chest (daily check-in), Steam (task missions), Stake (NFT locking), Hall of Fame (rankings), and Profile (your stats and identity).",
  },
  {
    question: "How does NFT locking work?",
    answer: "Own a FarFISH NFT, then lock it for 30–360 days to earn yield. Rarer NFTs unlock higher multipliers. Release anytime after the lock period ends.",
  },
  {
    question: "What determines my rank?",
    answer: "Your rank is based on total referrals and token balance. More activity = higher standing in the Hall of Fame.",
  },
  {
    question: "Is my data safe?",
    answer: "Yes. FarFISH is non-custodial and built on Base. You control your wallet and assets at all times — we never hold your funds.",
  },
  {
    question: "How do referrals work?",
    answer: "Share your referral link to earn 20 tokens per new user. Hit milestones (5, 10, 30, 50 referrals) for bonus rewards on top.",
  },
  {
    question: "When can I trade FRH?",
    answer: "FRH token listing is planned for Q1 2027. Until then, focus on building your daily habits and accumulating tokens.",
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
      <main className="py-4 w-full">
        <div className="flex flex-col gap-4">
          {/* Profile Identity Section */}
          <section className="glass-card rounded-3xl no-button-ring">
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
              <h2 className="text-xl font-bold text-white leading-tight mb-6">
                Frequently Asked Questions
              </h2>

              <div className="space-y-3">
                {faqItems.map((faq, idx) => {
                  const open = openIdx === idx;
                  return (
                    <div
                      key={faq.question}
                      className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition-all duration-300"
                    >
                      <button
                        className="faq-no-ring flex w-full items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
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