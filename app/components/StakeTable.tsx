"use client";

import React from "react";
import { RARITY_DISPLAY, STAKING_REWARDS, STAKING_TOKEN_RANGES } from "../constants";

export default function StakeTable() {
  const rarities = Object.keys(STAKING_TOKEN_RANGES) as Array<keyof typeof STAKING_TOKEN_RANGES>;
  const lockDurations: Array<30 | 90 | 180 | 360> = [30, 90, 180, 360];

  const rarityStyles = {
    Bluefin: { 
      gradient: "from-teal/20 to-mint/10", 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
        </svg>
      ), 
      color: "text-teal" 
    },
    GoldRay: { 
      gradient: "from-teal/20 to-mint/10", 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ), 
      color: "text-teal" 
    },
    RedSpike: { 
      gradient: "from-teal/20 to-mint/10", 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7.5,4A5.5,5.5 0 0,0 2,9.5C2,10 2,10.5 2,11H22C22,10.5 22,10 22,9.5A5.5,5.5 0 0,0 16.5,4C14.64,4 13.09,4.91 12,6.34C10.91,4.91 9.36,4 7.5,4Z"/>
        </svg>
      ), 
      color: "text-teal" 
    },
    ShadowGill: { 
      gradient: "from-teal/20 to-mint/10", 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5,16L3,5H1V3H4L6,14L7,18H20V16H5Z M19,5V7H17V5H19Z M17,8H19V10H17V8Z M19,11V13H17V11H19Z"/>
        </svg>
      ), 
      color: "text-teal" 
    },
  };

  return (
    <section className="glass-card rounded-3xl p-6 shadow-elevated backdrop-blur-4xl overflow-hidden">
      <div className="relative z-10">
        <h3 className="font-bold text-lg text-teal mb-6">Staking Rewards</h3>
        
        {/* Reward Parameters Table with Horizontal Scroll */}
        <div className="mb-6">
          <div className="rounded-2xl bg-surface border border-teal/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-fixed" style={{ minWidth: '480px' }}>
                <thead className="bg-elevated">
                  <tr className="text-teal/80 border-b border-teal/20">
                    <th className="text-left py-3 px-3 font-bold text-xs" style={{ width: '140px' }}>Name</th>
                    <th className="text-center py-3 px-2 font-bold text-xs" style={{ width: '85px' }}>30d<br/>FRH</th>
                    <th className="text-center py-3 px-2 font-bold text-xs" style={{ width: '85px' }}>90d<br/>FRH</th>
                    <th className="text-center py-3 px-2 font-bold text-xs" style={{ width: '85px' }}>180d<br/>FRH</th>
                    <th className="text-center py-3 px-2 font-bold text-xs" style={{ width: '85px' }}>360d<br/>FRH</th>
                  </tr>
                </thead>
                <tbody>
                  {rarities.map((rarity, index) => {
                    const rewards = STAKING_REWARDS[rarity];
                    const display = RARITY_DISPLAY[rarity];
                    const style = rarityStyles[rarity as keyof typeof rarityStyles];

                    return (
                      <tr 
                        key={rarity} 
                        className="border-b border-teal/10 hover:bg-teal/5 transition-colors"
                      >
                        <td className="py-3 px-3" style={{ width: '140px' }}>
                          <div className="text-left">
                            <div className="font-bold text-teal text-xs leading-tight">{display.name}</div>
                            <div className={`font-normal ${style.color} text-xs leading-tight`}>({display.rarityLabel})</div>
                          </div>
                        </td>
                        {lockDurations.map((duration) => (
                          <td key={duration} className="py-3 px-2 text-center" style={{ width: '85px' }}>
                            <div className="font-bold text-teal text-xs">
                              {rewards[duration].toLocaleString()}
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}