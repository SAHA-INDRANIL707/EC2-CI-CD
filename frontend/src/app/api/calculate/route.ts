import { NextRequest, NextResponse } from "next/server";
import { API_ROUTES, INTERNAL_BACKEND_URL } from "@/config/apiConfig";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { num1, num2, operation } = body;

    // Validate incoming payload
    if (num1 === undefined || num2 === undefined || !operation) {
      return NextResponse.json(
        { detail: "Missing required fields: num1, num2, and operation." },
        { status: 400 }
      );
    }

    const payload = {
      num1: Number(num1),
      num2: Number(num2),
      operation: String(operation)
    };

    // 1. Primary request to Python Backend configured via apiConfig.ts
    try {
      const response = await fetch(API_ROUTES.PYTHON_CALCULATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store"
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch (primaryErr: any) {
      // 2. Fallback to host port (useful for local development outside Docker)
      const fallbackUrl = "http://127.0.0.1:3001/api/calculate";
      try {
        const fallbackRes = await fetch(fallbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store"
        });
        const data = await fallbackRes.json();
        return NextResponse.json(data, { status: fallbackRes.status });
      } catch (_) {
        return NextResponse.json(
          { 
            detail: `Next.js Server could not reach Python Backend at ${API_ROUTES.PYTHON_CALCULATE}: ${primaryErr?.message || "Connection refused"}` 
          },
          { status: 502 }
        );
      }
    }

  } catch (error: any) {
    return NextResponse.json(
      { detail: `Next.js Server Error: ${error.message || "Internal error"}` },
      { status: 500 }
    );
  }
}
