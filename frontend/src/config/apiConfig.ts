/**
 * Dynamic API & Server Configuration
 * Fully IP-agnostic: Automatically adapts to any IP, localhost, domain, or cloud instance.
 */

// 1. Internal Backend URL (Docker internal service DNS or local fallback)
export const INTERNAL_BACKEND_URL =
  process.env.INTERNAL_BACKEND_URL || "http://backend:8000";

// 2. Dynamic Host Resolution helper (automatically detects current browser host/IP)
export const getHost = (): string => {
  if (typeof window !== "undefined") {
    return window.location.hostname;
  }
  return "localhost";
};

// 3. Port Definitions
export const PORTS = {
  FRONTEND: 3000,
  BACKEND_HOST: 3001,
  BACKEND_INTERNAL: 8000,
};

// 4. API Endpoints Map (Uses relative paths for seamless proxying)
export const API_ROUTES = {
  // Client-Facing Next.js API Routes (resolves dynamically on any IP/domain)
  CLIENT_CALCULATE: "/app1/api/calculate/",
  CLIENT_HEALTH: "/app1/api/health/",

  // Direct Backend Python Endpoints (server-to-server)
  PYTHON_CALCULATE: `${INTERNAL_BACKEND_URL}/api/calculate`,
  PYTHON_HEALTH: `${INTERNAL_BACKEND_URL}/health`,
};
