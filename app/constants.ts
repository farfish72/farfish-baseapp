// Removed duplicate exports - keeping the validated versions below
// Validate contract addresses at startup
const validateAddress = (address: string, name: string): string => {
  if (!address) {
    throw new Error(`${name} is required but not set in environment variables`);
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(`${name} is not a valid Ethereum address: ${address}`);
  }
  return address;
};
export const NFT_CONTRACT_ADDRESS = validateAddress(
  process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ?? "", 
  "NEXT_PUBLIC_NFT_CONTRACT_ADDRESS"
) as `0x${string}`;
export const STAKING_CONTRACT_ADDRESS = validateAddress(
  process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS ?? "", 
  "NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS"
) as `0x${string}`;
export const ERC20_TOKEN_ADDRESS = validateAddress(
  process.env.NEXT_PUBLIC_ERC20_TOKEN_ADDRESS ?? "", 
  "NEXT_PUBLIC_ERC20_TOKEN_ADDRESS"
);
export const CLAIM_CONTROLLER_ADDRESS = validateAddress(
  process.env.NEXT_PUBLIC_CLAIM_CONTROLLER_ADDRESS ?? "", 
  "NEXT_PUBLIC_CLAIM_CONTROLLER_ADDRESS"
) as `0x${string}`;

// Referral system removed - Base App must be pure consumer app

export const NFT_SUPPLY_TOTAL = 9999;

// Staking token ranges and reward configuration
export const STAKING_TOKEN_RANGES = {
  Bluefin: { min: 0, max: 6, representativeTokenId: 0 },
  GoldRay: { min: 7, max: 11, representativeTokenId: 7 },
  RedSpike: { min: 12, max: 14, representativeTokenId: 12 },
  ShadowGill: { min: 15, max: 15, representativeTokenId: 15 },
} as const;

export const RARITY_DISPLAY: Record<keyof typeof STAKING_TOKEN_RANGES, { name: string; rarityLabel: string }> = {
  Bluefin: { name: "BlueFin", rarityLabel: "Common" },
  GoldRay: { name: "GoldRay", rarityLabel: "Rare" },
  RedSpike: { name: "RedSpike", rarityLabel: "Epic" },
  ShadowGill: { name: "ShadowGill", rarityLabel: "Legendary" },
};

// Reward table: [rarity][lockDays] = FRH reward amount
export const STAKING_REWARDS: Record<keyof typeof STAKING_TOKEN_RANGES, Record<30 | 90 | 180 | 360, number>> = {
  Bluefin: { 30: 120, 90: 240, 180: 480, 360: 960 },
  GoldRay: { 30: 240, 90: 480, 180: 960, 360: 1920 },
  RedSpike: { 30: 480, 90: 960, 180: 1920, 360: 3840 },
  ShadowGill: { 30: 960, 90: 1920, 180: 3840, 360: 7680 },
};

// Helper function to get rarity from tokenId
export const getRarityFromTokenId = (tokenId: number): keyof typeof STAKING_TOKEN_RANGES | null => {
  if (tokenId >= 0 && tokenId <= 6) return "Bluefin";
  if (tokenId >= 7 && tokenId <= 11) return "GoldRay";
  if (tokenId >= 12 && tokenId <= 14) return "RedSpike";
  if (tokenId === 15) return "ShadowGill";
  return null;
};

export const getNameFromRarity = (rarity: keyof typeof STAKING_TOKEN_RANGES | null): string | null => {
  if (!rarity) return null;
  return RARITY_DISPLAY[rarity]?.name ?? null;
};

export const getRarityLabel = (rarity: keyof typeof STAKING_TOKEN_RANGES | null): string | null => {
  if (!rarity) return null;
  return RARITY_DISPLAY[rarity]?.rarityLabel ?? null;
};

// Helper function to get representative tokenId for a rarity
export const getRepresentativeTokenId = (rarity: keyof typeof STAKING_TOKEN_RANGES): number => {
  return STAKING_TOKEN_RANGES[rarity].representativeTokenId;
};

// Helper function to get name directly from tokenId (0-15)
export const getNameFromTokenId = (tokenId: number): string | null => {
  const rarity = getRarityFromTokenId(tokenId);
  return getNameFromRarity(rarity);
};

// Helper function to get rarity label directly from tokenId (0-15)
export const getRarityLabelFromTokenId = (tokenId: number): string | null => {
  const rarity = getRarityFromTokenId(tokenId);
  return getRarityLabel(rarity);
};

// Get rewards for a tokenId
export const getRewardsForTokenId = (tokenId: number): Record<30 | 90 | 180 | 360, number> | null => {
  const rarity = getRarityFromTokenId(tokenId);
  if (!rarity) return null;
  return STAKING_REWARDS[rarity];
};