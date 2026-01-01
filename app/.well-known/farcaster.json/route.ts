export async function GET() {
  return Response.json({
    accountAssociation: {
      header: "eyJmaWQiOjE0ODExMDYsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhjN0E0QjNDMTRhMjhDREY2NTIyNWJhMTRDNjdFMUIxOGUxMUY5NDIyIn0",
      payload: "eyJkb21haW4iOiJmYXJmaXNoLWJhc2VhcHAudmVyY2VsLmFwcCJ9",
      signature: "ypecNFm+6U+qDiSdIuUj46L8B8CIKj+JuscDGNXL+skW95Ymsai5zqlp8c1k/NQw/QqjVf2QagLeZu0MXYiYxBw="
    },
    frame: {
      version: "1",
      name: "Example Frame",
      iconUrl: "https://farfish-baseapp.vercel.app/icon.png",
      homeUrl: "https://farfish-baseapp.vercel.app",
      imageUrl: "https://farfish-baseapp.vercel.app/image.png",
      buttonTitle: "Check this out",
      splashImageUrl: "https://farfish-baseapp.vercel.app/splash.png",
      splashBackgroundColor: "#eeccff",
      webhookUrl: "https://farfish-baseapp.vercel.app/api/webhook"
    }
  });
}
