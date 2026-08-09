import { NextResponse } from "next/server"
import { env } from "@/env"

export async function GET() {
  const baseUrl = env.NEXT_PUBLIC_APP_URL
  return NextResponse.json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/oauth/authorize`,
    token_endpoint: `${baseUrl}/oauth/token`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
  })
}
