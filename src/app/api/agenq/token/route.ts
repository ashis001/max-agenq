import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  console.log("body", body);
  const response = await fetch(
    `${process.env.AGENQ_BACKEND_URL}/runtime/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.AGENQ_API_KEY || "",
      },
      body: JSON.stringify({
        customerCode: body.customerCode,
        projectId: body.projectId,
        agentId: body.agentId,
        sessionId: body.sessionId,
      }),
    },
  );

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
