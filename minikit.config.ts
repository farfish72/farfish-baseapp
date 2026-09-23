const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header:
      "eyJmaWQiOjE0ODExMDYsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhjN0E0QjNDMTRhMjhDREY2NTIyNWJhMTRDNjdFMUIxOGUxMUY5NDIyIn0",
    payload:
      "eyJkb21haW4iOiJmYXJmaXNoLWJhc2VhcHAudmVyY2VsLmFwcCJ9",
    signature:
      "ypecNFm+6U+qDiSdIuUj46L8B8CIKj+JuscDGNXL+skW95Ymsai5zqlp8c1k/NQw/QqjVf2QagLeZu0MXYiYxBw=",
  },

  baseBuilder: {
    ownerAddress: "bc_vcey6gjj",
  },

  miniapp: {
    version: "1",
    name: "FarFISH",
    noindex: true,

    subtitle: "Mint • Stake • Earn",
    tagline: "Earn Rewards Daily",

    description:
      "Mint. Stake. Earn. Dominate the Seas. Premium NFT collection built on Base. NFT Staking • Leaderboard • Monthly Rewards.",

    iconUrl: `${ROOT_URL}/icon.png`,
    imageUrl: `${ROOT_URL}/og-image.png`,
    heroImageUrl: `${ROOT_URL}/og-image.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",

    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    castShareUrl: `${ROOT_URL}/share`,

    screenshotUrls: [
      `${ROOT_URL}/s1-optimized.webp`,
      `${ROOT_URL}/s2-optimized.webp`,
      `${ROOT_URL}/s3-optimized.webp`,
    ],

    buttonTitle: "Launch",

    primaryCategory: "utility",
    tags: ["nft", "staking", "rewards", "onchain", "utility"],

    ogTitle: "FarFISH",
    ogDescription: "Stake NFT • Earn Rewards • Dominate the Seas",
    ogImageUrl: `${ROOT_URL}/og-image.png`,
  },
} as const;