export async function POST(request: Request) {
  try {
    const body = await request.json()

    const decode = (encoded: string) => {
      return JSON.parse(
        Buffer.from(encoded, "base64url").toString("utf-8")
      )
    }

    const { header, payload } = body

    if (!header || !payload) {
      return Response.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      )
    }

    const headerData = decode(header)
    const eventData = decode(payload)

    // ✅ এখানে চাইলে future-এ event type দেখে কাজ করতে পারবে
    // console.log("Webhook event:", eventData)

    return Response.json({
      ok: true
    })
  } catch (err) {
    return Response.json(
      { error: "Webhook error" },
      { status: 500 }
    )
  }
}