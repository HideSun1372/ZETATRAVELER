import { useEffect, useState } from "react";

export function ColdStartScreen() {
  const [elapsed, setElapsed] = useState(0);
  const [showConnectivityError, setShowConnectivityError] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => setElapsed(Date.now() - start), 500);
    const errorTimer = setTimeout(() => setShowConnectivityError(true), 180_000);
    return () => { clearInterval(tick); clearTimeout(errorTimer); };
  }, []);

  const elapsedSec = Math.floor(elapsed / 1000);
  const progress = Math.min((elapsed / 30_000) * 90, 90);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000010",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        fontFamily: "Inter, sans-serif",
        color: "#c8d8ff",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", textAlign: "center", maxWidth: "360px" }}>
        <p style={{ fontSize: "1.1rem", fontWeight: 600, letterSpacing: "0.05em", margin: 0 }}>
          Establishing connection...
        </p>
        <p style={{ fontSize: "0.8rem", color: "#6a82b0", margin: 0, lineHeight: 1.6 }}>
          Connection usually gets interrupted by inactivity.
          Reestablishing takes roughly 30 seconds.
        </p>

        <div style={{ width: "100%", marginTop: "0.5rem" }}>
          <div style={{ height: "3px", width: "100%", background: "#1a2040", borderRadius: "999px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #3b5bdb, #74c0fc)",
                borderRadius: "999px",
                transition: "width 0.5s ease-out",
              }}
            />
          </div>    
          <p style={{ fontSize: "0.7rem", color: "#4a5a80", marginTop: "0.4rem" }}>{elapsedSec}s</p>
        </div>

        {showConnectivityError && (
          <p style={{ fontSize: "0.7rem", color: "#4a5a80", margin: 0 }}>
            It seems establishing a connection is not achievable. Are you connected to the internet?
          </p>
        )}
      </div>
    </div>
  );
}
