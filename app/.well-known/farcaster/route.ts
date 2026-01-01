export async function GET() {
  return Response.json({
    accountAssociation: {
      header: "",
      payload: "",
      signature: "",
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
        "Mint NFTs, stake them, and earn on-chain rewards.",
      primaryCategory: "games",
      tags: ["nft", "staking", "base"],
      heroImageUrl: "https://farfish-baseapp.vercel.app/og-image.png",
      screenshotUrls: [
        "https://farfish-baseapp.vercel.app/screenshot-1.png",
      ],
      ogTitle: "FarFISH on Base",
      ogDescription: "Mint • Stake • Earn on Base",
      ogImageUrl: "https://farfish-baseapp.vercel.app/og-image.png",
      noindex: false,
    },
  })
}