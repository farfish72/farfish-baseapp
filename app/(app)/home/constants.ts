export const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}` | undefined;

export function getNameFromTokenId(tokenId: number): string | null {
  const names = [
    "BlueFin", "GoldRay", "RedSpike", "ShadowGill",
    "BlueFin", "GoldRay", "RedSpike", "ShadowGill", 
    "BlueFin", "GoldRay", "RedSpike", "ShadowGill",
    "BlueFin", "GoldRay", "RedSpike", "ShadowGill"
  ];
  
  return names[tokenId] || null;
}