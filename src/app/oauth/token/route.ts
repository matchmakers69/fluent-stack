import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json({
    access_token: "local-dev-token",
    token_type: "Bearer",
    expires_in: 86400,
  })
}
