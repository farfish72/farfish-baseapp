"use client";

import { useState } from 'react';
import Image from 'next/image';

interface OnboardingModalProps {
  onComplete: () => void;
}

/**
 * Onboarding Modal Component
 * 
 * Explains FarFISH purpose and how to get started.
 * Required by Base App guidelines for clear onboarding.
 * 
 * @see https://docs.base.org/mini-apps/featured-guidelines/overview
 */
export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: '🐟',
      title: 'Welcome to FarFISH',
      description: 'A premium NFT collection on Base Network. Mint, stake, and earn rewards.',
      image: '/og-image-optimized.webp',
    },
    {
      icon: '💎',
      title: 'Mint Your NFT',
      description: 'Select from 4 rarity tiers: BlueFin, GoldRay, RedSpike, and ShadowGill. Each has unique rewards.',
      image: '/bluefin.jpg',
    },
    {
      icon: '🏆',
      title: 'Stake & Earn',
      description: 'Stake your NFTs to earn daily rewards. Higher rarity tiers yield greater rewards. Compete on the leaderboard!',
      image: '/goldray.jpg',
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Image */}
        <div className="relative w-full aspect-[16/9]">
          <Image
            src={currentStepData.image}
            alt={currentStepData.title}
            fill
            className="object-cover"
            priority
          />
          {/* Step Indicator Overlay */}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-white text-sm font-medium">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4">
            <span className="text-3xl">{currentStepData.icon}</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-3">
            {currentStepData.title}
          </h2>

          {/* Description */}
          <p className="text-white/80 text-base leading-relaxed mb-6">
            {currentStepData.description}
          </p>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-gradient-primary'
                    : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-semibold transition-all duration-300 hover:bg-white/20"
              >
                Skip Tutorial
              </button>
            )}
            <button
              onClick={handleNext}
              className={`${
                isLastStep ? 'flex-1' : 'flex-1'
              } py-3 rounded-2xl bg-gradient-primary text-black font-semibold transition-all duration-300 hover:shadow-lg`}
            >
              {isLastStep ? 'Get Started' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
