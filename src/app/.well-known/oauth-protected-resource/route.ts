import { NextResponse } from "next/server"
import { env } from "@/env"

export async function GET() {
  const baseUrl = env.NEXT_PUBLIC_APP_URL
  return NextResponse.json({
    resource: `${baseUrl}/api/mcp/streamable-http`,
    authorization_servers: [baseUrl],
  })
}
