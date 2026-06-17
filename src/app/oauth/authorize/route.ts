import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const redirectUri = url.searchParams.get("redirect_uri")
  const state = url.searchParams.get("state")
  if (!redirectUri) {
    return new NextResponse("Missing redirect_uri", { status: 400 })
  }
  const callbackUrl = new URL(redirectUri)
  callbackUrl.searchParams.set("code", "local-dev-token")
  if (state) callbackUrl.searchParams.set("state", state)
  return NextResponse.redirect(callbackUrl.toString())
}
