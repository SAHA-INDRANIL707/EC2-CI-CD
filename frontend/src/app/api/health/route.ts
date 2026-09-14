import { NextResponse } from "next/server";
import { API_ROUTES } from "@/config/apiConfig";

export async function GET() {
  const targetEndpoints = [
    API_ROUTES.PYTHON_HEALTH,
    "http://127.0.0.1:3001/health",
    "http://localhost:3001/health"
  ];

  for (const url of targetEndpoints) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const pyData = await res.json();
        return NextResponse.json({
          status: "healthy",
          frontend: "nextjs-server-online",
          backend: pyData,
          backend_url: url
        });
      }
    } catch (_) {}
  }

  return NextResponse.json(
    { 
      status: "degraded", 
      frontend: "nextjs-server-online", 
      backend: "unreachable",
      target: API_ROUTES.PYTHON_HEALTH 
    },
    { status: 503 }
  );
}
