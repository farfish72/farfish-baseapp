export async function GET() {
  return Response.json({
    accountAssociation: {
      header:
        "eyJmaWQiOjE0ODExMDYsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhjN0E0QjNDMTRhMjhDREY2NTIyNWJhMTRDNjdFMUIxOGUxMUY5NDIyIn0",
      payload:
        "eyJkb21haW4iOiJmYXJmaXNoLWJhc2VhcHAudmVyY2VsLmFwcCJ9",
      signature:
        "ypecNFm+6U+qDiSdIuUj46L8B8CIKj+JuscDGNXL+skW95Ymsai5zqlp8c1k/NQw/QqjVf2QagLeZu0MXYiYxBw=",
    },

    miniapp: {
      version: "1",
      name: "FarFISH",

      homeUrl: "https://farfish-baseapp.vercel.app",
      iconUrl: "https://farfish-baseapp.vercel.app/icon.png",

      splashImageUrl: "https://farfish-baseapp.vercel.app/splash.png",
      splashBackgroundColor: "#000000",

      subtitle: "Mint • Stake • Earn",
      tagline: "Earn rewards on Base",

      description:
        "Mint NFTs, stake them, and earn on-chain rewards on Base.",

      primaryCategory: "games",
      tags: ["nft", "staking", "base"],

      heroImageUrl:
        "https://farfish-baseapp.vercel.app/og-image.png",

      screenshotUrls: [
        "https://farfish-baseapp.vercel.app/screenshot-1.png",
      ],

      ogTitle: "FarFISH on Base",
      ogDescription: "Mint • Stake • Earn on Base",
      ogImageUrl:
        "https://farfish-baseapp.vercel.app/og-image.png",

      noindex: false,
    },
  });
}
