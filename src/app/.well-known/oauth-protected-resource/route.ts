import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return NextResponse.json({
    resource: `${baseUrl}/api/mcp/streamable-http`,
    authorization_servers: [baseUrl],
  })
}
