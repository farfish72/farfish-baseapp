"use client";

import { useAccount, useReadContract } from "wagmi";
import { NFT_CONTRACT_ADDRESS } from "../constants";
import nftAbi from "../abi/nftDrop.json";

export function useNFTStatus() {
  const { address } = useAccount();

  // Check if user has minted any NFTs (balance > 0)
  const { data: nftBalance } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: nftAbi as any,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && NFT_CONTRACT_ADDRESS) },
  });

  const hasMintedNFT = Boolean(nftBalance && Number(nftBalance) > 0);

  return {
    hasMintedNFT,
    nftBalance: nftBalance ? Number(nftBalance) : 0,
  };
}