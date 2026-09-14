"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Calculator as CalcIcon, 
  Activity, 
  Zap, 
  Server, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Code2,
  Delete,
  RotateCcw
} from "lucide-react";

interface CalculationRecord {
  id: string;
  expression: string;
  result: number;
  latencyMs: number;
  timestamp: string;
}

interface ApiLog {
  request: {
    num1: number;
    num2: number;
    operation: string;
  };
  response: any;
  status: number;
  latencyMs: number;
  time: string;
}

const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function CalculatorPage() {
  const [displayValue, setDisplayValue] = useState<string>("0");
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [pendingOperation, setPendingOperation] = useState<string | null>(null);
  const [historyExpression, setHistoryExpression] = useState<string>("");
  const [isNewInput, setIsNewInput] = useState<boolean>(true);
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inspector & health state
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [latestLog, setLatestLog] = useState<ApiLog | null>(null);

  // Check backend health
  const checkBackendHealth = useCallback(async () => {
    try {
      // Check via /app2/health (Nginx proxy) or BACKEND_API_BASE or fallback
      const healthEndpoints = [
        BACKEND_API_BASE ? `${BACKEND_API_BASE}/health` : "/app2/health",
        "/app2/health",
        "/health/py",
        "http://localhost:3001/health"
      ];

      for (const endpoint of healthEndpoints) {
        try {
          const res = await fetch(endpoint, { cache: "no-store" });
          if (res.ok) {
            setBackendStatus("online");
            return;
          }
        } catch (_) {}
      }
      setBackendStatus("offline");
    } catch (err) {
      setBackendStatus("offline");
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 10000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  // Request Python API calculation
  const executeCalculation = async (num1: number, num2: number, op: string) => {
    setIsComputing(true);
    setErrorMessage(null);
    const startTime = performance.now();

    const requestPayload = {
      num1: num1,
      num2: num2,
      operation: op
    };

    // Try Nginx /app2/api/calculate first, then configured base, then localhost fallback
    const endpointsToTry = [
      BACKEND_API_BASE ? `${BACKEND_API_BASE}/api/calculate` : "/app2/api/calculate",
      "/app2/api/calculate",
      "/api/py/calculate",
      "http://localhost:3001/api/calculate"
    ];

    let response: Response | null = null;
    let successfulUrl = "";

    for (const url of endpointsToTry) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
        });
        if (res.status !== 404) {
          response = res;
          successfulUrl = url;
          break;
        }
      } catch (_) {}
    }

    try {
      if (!response) {
        throw new Error("Could not reach Python calculation service at /app2 or backend ports");
      }

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      const data = await response.json();

      setLatestLog({
        request: requestPayload,
        response: data,
        status: response.status,
        latencyMs: latency,
        time: new Date().toLocaleTimeString(),
      });

      if (!response.ok) {
        const errorDetail = data.detail || "Calculation error on Python backend";
        setErrorMessage(errorDetail);
        setDisplayValue("Error");
        setHistoryExpression(`${num1} ${getSymbol(op)} ${num2}`);
        setStoredValue(null);
        setPendingOperation(null);
        setIsNewInput(true);
        return;
      }

      // Success
      const resultValue = data.result;
      setDisplayValue(String(resultValue));
      setHistoryExpression(data.expression);
      setStoredValue(resultValue);
      setPendingOperation(null);
      setIsNewInput(true);
      setBackendStatus("online");

      // Add to history
      const newRecord: CalculationRecord = {
        id: Math.random().toString(36).substring(2, 9),
        expression: data.expression,
        result: resultValue,
        latencyMs: latency,
        timestamp: new Date().toLocaleTimeString(),
      };
      setHistory(prev => [newRecord, ...prev.slice(0, 9)]);

    } catch (err: any) {
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      setBackendStatus("offline");
      setErrorMessage("Backend unreachable. Ensure Python service is running.");
      setDisplayValue("Offline");
      setLatestLog({
        request: requestPayload,
        response: { error: err.message || "Failed to reach Python API" },
        status: 503,
        latencyMs: latency,
        time: new Date().toLocaleTimeString(),
      });
      setStoredValue(null);
      setPendingOperation(null);
      setIsNewInput(true);
    } finally {
      setIsComputing(false);
    }
  };

  // Helper for UI symbol
  const getSymbol = (op: string) => {
    switch (op) {
      case "add": case "+": return "+";
      case "subtract": case "-": return "−";
      case "multiply": case "*": return "×";
      case "divide": case "/": return "÷";
      case "modulo": case "%": return "%";
      case "power": case "^": return "^";
      default: return op;
    }
  };

  // Digit Input Handler
  const handleDigit = (digit: string) => {
    if (errorMessage) setErrorMessage(null);

    if (isNewInput) {
      setDisplayValue(digit === "." ? "0." : digit);
      setIsNewInput(false);
    } else {
      if (digit === "." && displayValue.includes(".")) return;
      if (displayValue === "0" && digit !== ".") {
        setDisplayValue(digit);
      } else {
        setDisplayValue(displayValue + digit);
      }
    }
  };

  // Operator Input Handler
  const handleOperator = (op: string) => {
    if (errorMessage) setErrorMessage(null);
    const currentValue = parseFloat(displayValue);

    if (storedValue !== null && pendingOperation && !isNewInput) {
      // Chain calculation: execute previous pending operation on backend
      executeCalculation(storedValue, currentValue, pendingOperation);
      setPendingOperation(op);
      return;
    }

    setStoredValue(currentValue);
    setPendingOperation(op);
    setHistoryExpression(`${currentValue} ${getSymbol(op)}`);
    setIsNewInput(true);
  };

  // Equals Handler
  const handleEquals = () => {
    if (pendingOperation === null || storedValue === null) return;
    const currentValue = parseFloat(displayValue);
    executeCalculation(storedValue, currentValue, pendingOperation);
  };

  // Clear Handler
  const handleClear = () => {
    setDisplayValue("0");
    setStoredValue(null);
    setPendingOperation(null);
    setHistoryExpression("");
    setErrorMessage(null);
    setIsNewInput(true);
  };

  // Backspace / Delete Handler
  const handleDelete = () => {
    if (isNewInput || displayValue === "Error" || displayValue === "Offline") {
      setDisplayValue("0");
      setIsNewInput(true);
      return;
    }
    if (displayValue.length === 1 || (displayValue.length === 2 && displayValue.startsWith("-"))) {
      setDisplayValue("0");
      setIsNewInput(true);
    } else {
      setDisplayValue(displayValue.slice(0, -1));
    }
  };

  // Toggle Sign +/-
  const handleToggleSign = () => {
    if (displayValue === "0" || displayValue === "Error" || displayValue === "Offline") return;
    if (displayValue.startsWith("-")) {
      setDisplayValue(displayValue.substring(1));
    } else {
      setDisplayValue("-" + displayValue);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key >= "0" && e.key <= "9") || e.key === ".") {
        handleDigit(e.key);
      } else if (e.key === "+" || e.key === "-") {
        handleOperator(e.key === "+" ? "add" : "subtract");
      } else if (e.key === "*") {
        handleOperator("multiply");
      } else if (e.key === "/") {
        e.preventDefault();
        handleOperator("divide");
      } else if (e.key === "%") {
        handleOperator("modulo");
      } else if (e.key === "^") {
        handleOperator("power");
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleEquals();
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Escape") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [displayValue, storedValue, pendingOperation, isNewInput, errorMessage]);

  return (
    <main className="calculator-app-container">
      {/* Header Info */}
      <header className="app-header">
        <div className="badge-row">
          <span className="badge frontend">
            <Layers size={13} /> Next.js Frontend (Port 3000)
          </span>
          <span className="badge backend">
            <Server size={13} /> Python FastAPI (Port 3001)
          </span>
          <span className={`badge ${backendStatus === "online" ? "status-online" : backendStatus === "checking" ? "badge" : "status-offline"}`}>
            <span className="pulse-dot"></span>
            {backendStatus === "online" ? "Backend Online" : backendStatus === "checking" ? "Connecting..." : "Backend Disconnected"}
          </span>
        </div>
        <h1 className="app-title">Distributed Cloud Calculator</h1>
        <p className="app-subtitle">
          Next.js captures expressions and delegates computation directly to Python functions running inside containerized microservices.
        </p>
      </header>

      {/* Main Grid: Calculator & Service Inspector */}
      <div className="app-grid">
        {/* Calculator Component */}
        <section className="calculator-card" aria-label="Interactive Calculator">
          {/* LCD / OLED Display */}
          <div className="calc-screen">
            <div className="screen-header">
              <span>{pendingOperation ? `OP: ${pendingOperation.toUpperCase()}` : "READY"}</span>
              {isComputing && (
                <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--accent-cyan)" }}>
                  <span className="calc-computing-loader"></span> PYTHON COMPUTING
                </span>
              )}
            </div>

            <div className="history-text">
              {historyExpression || "\u00A0"}
            </div>

            <div className={`main-display ${errorMessage ? "has-error" : ""}`}>
              {errorMessage || displayValue}
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="calc-keypad">
            {/* Row 1 */}
            <button 
              className="btn btn-action" 
              onClick={handleClear} 
              title="Clear All (Esc)"
            >
              AC
            </button>
            <button 
              className="btn btn-action" 
              onClick={handleDelete} 
              title="Backspace"
            >
              <Delete size={20} />
            </button>
            <button 
              className={`btn btn-op ${pendingOperation === "power" ? "active" : ""}`} 
              onClick={() => handleOperator("power")} 
              title="Power (x^y)"
            >
              xʸ
            </button>
            <button 
              className={`btn btn-op ${pendingOperation === "divide" ? "active" : ""}`} 
              onClick={() => handleOperator("divide")} 
              title="Divide (/)"
            >
              ÷
            </button>

            {/* Row 2 */}
            <button className="btn btn-num" onClick={() => handleDigit("7")}>7</button>
            <button className="btn btn-num" onClick={() => handleDigit("8")}>8</button>
            <button className="btn btn-num" onClick={() => handleDigit("9")}>9</button>
            <button 
              className={`btn btn-op ${pendingOperation === "multiply" ? "active" : ""}`} 
              onClick={() => handleOperator("multiply")} 
              title="Multiply (*)"
            >
              ×
            </button>

            {/* Row 3 */}
            <button className="btn btn-num" onClick={() => handleDigit("4")}>4</button>
            <button className="btn btn-num" onClick={() => handleDigit("5")}>5</button>
            <button className="btn btn-num" onClick={() => handleDigit("6")}>6</button>
            <button 
              className={`btn btn-op ${pendingOperation === "subtract" ? "active" : ""}`} 
              onClick={() => handleOperator("subtract")} 
              title="Subtract (-)"
            >
              −
            </button>

            {/* Row 4 */}
            <button className="btn btn-num" onClick={() => handleDigit("1")}>1</button>
            <button className="btn btn-num" onClick={() => handleDigit("2")}>2</button>
            <button className="btn btn-num" onClick={() => handleDigit("3")}>3</button>
            <button 
              className={`btn btn-op ${pendingOperation === "add" ? "active" : ""}`} 
              onClick={() => handleOperator("add")} 
              title="Add (+)"
            >
              +
            </button>

            {/* Row 5 */}
            <button 
              className="btn btn-num" 
              onClick={handleToggleSign} 
              title="Toggle Positive/Negative"
            >
              ±
            </button>
            <button className="btn btn-num" onClick={() => handleDigit("0")}>0</button>
            <button className="btn btn-num" onClick={() => handleDigit(".")}>.</button>
            <button 
              className="btn btn-equal" 
              onClick={handleEquals} 
              disabled={isComputing}
              title="Calculate (Enter)"
            >
              =
            </button>
          </div>
        </section>

        {/* Live Service Inspector & Computation Feed */}
        <aside className="side-panel">
          {/* Architecture Pipeline Visualizer */}
          <div className="panel-card">
            <div className="panel-header">
              <span className="panel-title">
                <Zap size={16} color="#38bdf8" /> Microservice Flow
              </span>
            </div>
            <div className="arch-diagram">
              <div className="arch-node next">
                <span>Next.js UI</span>
                <small>React Client</small>
              </div>
              <span className="arch-arrow">➔</span>
              <div className="arch-node" style={{ color: "#a855f7", borderColor: "rgba(168, 85, 247, 0.4)" }}>
                <span>REST POST</span>
                <small>/api/calculate</small>
              </div>
              <span className="arch-arrow">➔</span>
              <div className="arch-node fastapi">
                <span>Python Engine</span>
                <small>calculate() func</small>
              </div>
            </div>
          </div>

          {/* Real-Time API Inspector */}
          <div className="panel-card">
            <div className="panel-header">
              <span className="panel-title">
                <Code2 size={16} color="#f59e0b" /> Live JSON Payload
              </span>
              {latestLog && (
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={12} /> {latestLog.latencyMs}ms
                </span>
              )}
            </div>
            {latestLog ? (
              <pre className="code-block">
                {JSON.stringify({
                  request: latestLog.request,
                  response: latestLog.response,
                  latency: `${latestLog.latencyMs}ms`
                }, null, 2)}
              </pre>
            ) : (
              <div className="empty-history">
                Perform a calculation to inspect live JSON payload exchange
              </div>
            )}
          </div>

          {/* History Feed */}
          <div className="panel-card">
            <div className="panel-header">
              <span className="panel-title">
                <Activity size={16} color="#10b981" /> Calculation Log
              </span>
              {history.length > 0 && (
                <button 
                  onClick={() => setHistory([])}
                  style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer" }}
                  title="Clear history"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <div className="empty-history">No calculations recorded yet</div>
            ) : (
              <div className="history-list">
                {history.map(item => (
                  <div 
                    key={item.id} 
                    className="history-item"
                    onClick={() => {
                      setDisplayValue(String(item.result));
                      setStoredValue(item.result);
                      setIsNewInput(true);
                    }}
                    title="Click to load result"
                  >
                    <span className="expr">{item.expression}</span>
                    <span className="res">{item.result}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <footer className="app-footer">
        Multi-container architecture powered by <strong>Next.js</strong> &amp; <strong>FastAPI</strong> in Docker Compose.
      </footer>
    </main>
  );
}
