import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  console.log("body", body);

  try {
    // Use AbortController to set a 15s timeout (default undici timeout is 10s)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const origin = request.headers.get("origin") || request.headers.get("referer");

    const response = await fetch(
      `${process.env.AGENQ_BACKEND_URL}/runtime/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.AGENQ_API_KEY || "",
          ...(origin ? { Origin: origin } : {}),
        },
        body: JSON.stringify({
          customerCode: body.customerCode,
          projectId: body.projectId,
          agentId: body.agentId,
          sessionId: body.sessionId,
          sessionAuthId: body.sessionAuthId,
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    const isTimeout =
      error?.name === "AbortError" ||
      error?.cause?.code === "UND_ERR_CONNECT_TIMEOUT";

    console.error("AgenQ token fetch error:", error?.message ?? error);

    return NextResponse.json(
      {
        error: isTimeout
          ? "AgenQ backend connection timed out. Please try again."
          : "Failed to fetch AgenQ token.",
        details: error?.message,
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
