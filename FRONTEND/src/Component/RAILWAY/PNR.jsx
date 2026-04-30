import React, { useState } from "react";
import axios from "axios";

/* ─── SHIMMER SCREEN ─────────────────────────────────────────────────────── */
const ShimmerScreen = ({ visible }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 9999,
    background: "#080808", overflow: "hidden",
    transition: "opacity 0.3s",
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? "auto" : "none",
  }}>
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(105deg, transparent 30%, rgba(245,158,11,0.12) 50%, transparent 70%)",
      backgroundSize: "250% 100%",
      animation: visible ? "shimmerSweep 1.4s ease-in-out infinite" : "none",
    }} />
    <div style={{ width: "88%", maxWidth: 600, margin: "0 auto", paddingTop: "15vh" }}>
      <div style={{ height: "6vh", width: "70%", borderRadius: 12, background: "rgba(255,255,255,0.05)", marginBottom: "2.5%", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ height: "3vh", width: "45%", borderRadius: 8, background: "rgba(255,255,255,0.05)", marginBottom: "1.5%", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ height: "3vh", width: "60%", borderRadius: 8, background: "rgba(255,255,255,0.05)", marginBottom: "5%", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(30%,1fr))", gap: "3%" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: "15vh", borderRadius: 16, background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
      </div>
    </div>
    <style>{`
      @keyframes shimmerSweep { 0% { background-position: -250% 0; } 100% { background-position: 250% 0; } }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    `}</style>
  </div>
);

export default function Pnr() {
  const [pnr, setPnr] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shimmer, setShimmer] = useState(false);

  const fetchPNR = async () => {
    if (pnr.length !== 10) { alert("Enter valid 10-digit PNR"); return; }
    setShimmer(true);
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/rail/${pnr}`);
      setData(res?.data?.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching PNR");
    } finally {
      setLoading(false);
      setShimmer(false);
    }
  };

  const handleClear = () => { setPnr(""); setData(null); };

  const getStatusStyle = (status = "") => {
    if (status.includes("CNF"))  return { bg: "#0a2e1a", text: "#4ade80", border: "#166534" };
    if (status.includes("WL"))   return { bg: "#2d1010", text: "#f87171", border: "#991b1b" };
    if (status.includes("CAN"))  return { bg: "#2d1010", text: "#f87171", border: "#991b1b" };
    if (status.includes("RLWL")) return { bg: "#2d1a00", text: "#fb923c", border: "#9a3412" };
    return { bg: "#1a1a2e", text: "#a78bfa", border: "#5b21b6" };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(135deg, #020617 0%, #0a0f1e 50%, #020617 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "4% 5%",
      fontFamily: "'DM Sans', sans-serif",
      boxSizing: "border-box",
    }}>
      <ShimmerScreen visible={shimmer} />

      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slide  { 0% { transform:translateX(-100%) } 100% { transform:translateX(350%) } }
        * { box-sizing: border-box; }

        .pnr-input:focus { border-color: rgba(99,102,241,0.6) !important; }

        .pnr-grid-detail {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .pnr-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 2%;
          padding: 0 4% 3%;
        }

        .pnr-route {
          display: flex;
          align-items: center;
          gap: 3%;
          margin-top: 4%;
          flex-wrap: nowrap;
        }

        .pnr-fare-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 2%;
          border-top: 0.5px solid rgba(255,255,255,0.06);
          padding: 3% 4%;
          background: rgba(99,102,241,0.04);
        }

        @media (max-width: 480px) {
          .pnr-route { flex-wrap: wrap; }
          .pnr-grid-detail { grid-template-columns: 1fr; }
          .pnr-tags { gap: 2% !important; }
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: "min(600px, 96%)" }}>

        {/* Header */}
        <div style={{ marginBottom: "5%", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "2%",
            background: "rgba(99,102,241,0.08)",
            border: "0.5px solid rgba(99,102,241,0.25)",
            borderRadius: "100px",
            padding: "1.5% 4% 1.5% 2.5%",
            marginBottom: "3%",
          }}>
            <span style={{ fontSize: "clamp(14px, 3vw, 18px)" }}>🚆</span>
            <span style={{ fontSize: "clamp(10px, 2vw, 12px)", color: "#818cf8", letterSpacing: "0.1em", textTransform: "uppercase" }}>Indian Railways</span>
          </div>
          <h1 style={{ color: "#f1f5f9", fontSize: "clamp(18px, 4.5vw, 28px)", fontWeight: "600", margin: 0, letterSpacing: "-0.02em" }}>PNR Status</h1>
          <p style={{ color: "#475569", fontSize: "clamp(11px, 2.5vw, 14px)", margin: "2% 0 0" }}>Enter your 10-digit PNR to check live status</p>
        </div>

        {/* Search Card */}
        <div style={{
          background: "rgba(15,23,42,0.8)",
          backdropFilter: "blur(20px)",
          border: "0.5px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "4% 5%",
          marginBottom: "4%",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}>
          <div style={{ display: "flex", gap: "2.5%", alignItems: "stretch" }}>
            <input
              type="text"
              value={pnr}
              maxLength={10}
              onChange={(e) => setPnr(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => { if (e.key === "Enter") fetchPNR(); }}
              placeholder="Enter PNR number"
              className="pnr-input"
              style={{
                flex: 1,
                minWidth: 0,
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "3% 4%",
                color: "#f1f5f9",
                fontSize: "clamp(12px, 2.8vw, 16px)",
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.12em",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
            <button
              onClick={fetchPNR}
              disabled={loading}
              style={{
                flexShrink: 0,
                background: loading ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.9)",
                border: "none",
                borderRadius: "12px",
                padding: "3% clamp(12px, 4vw, 22px)",
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "clamp(11px, 2.5vw, 14px)",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "Checking…" : "Check →"}
            </button>
            {data && (
              <button
                onClick={handleClear}
                style={{
                  flexShrink: 0,
                  background: "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "3% clamp(10px, 3vw, 16px)",
                  color: "#64748b",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "clamp(12px, 2.5vw, 14px)",
                  cursor: "pointer",
                }}
              >✕</button>
            )}
          </div>

          {loading && (
            <div style={{ marginTop: "3%", display: "flex", alignItems: "center" }}>
              <div style={{ width: "100%", height: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "40%", background: "linear-gradient(90deg, transparent, #6366f1, transparent)", animation: "slide 1.2s infinite", borderRadius: "2px" }} />
              </div>
            </div>
          )}
        </div>

        {/* Result Ticket */}
        {data && !loading && (
          <div style={{
            background: "rgba(15,23,42,0.9)",
            backdropFilter: "blur(20px)",
            border: "0.5px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
            animation: "fadeUp 0.4s ease",
          }}>

            {/* Ticket Header */}
            <div style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
              padding: "4% 5%",
              borderBottom: "0.5px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "3%" }}>
                <div style={{ flex: 1, minWidth: "55%" }}>
                  <div style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "#6366f1", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "2%" }}>
                    Train {data.trainNumber}
                  </div>
                  <div style={{ fontSize: "clamp(14px, 3.5vw, 20px)", fontWeight: "600", color: "#f1f5f9", letterSpacing: "-0.01em" }}>
                    {data.trainName}
                  </div>
                  <div style={{ fontSize: "clamp(10px, 2vw, 12px)", color: "#475569", marginTop: "2%" }}>
                    Class {data.journeyClass} · Quota {data.quota} · PNR {data.pnrNumber}
                  </div>
                </div>
                <div style={{
                  background: getStatusStyle(data.passengerList?.[0]?.currentStatus).bg,
                  color: getStatusStyle(data.passengerList?.[0]?.currentStatus).text,
                  border: `0.5px solid ${getStatusStyle(data.passengerList?.[0]?.currentStatus).border}`,
                  borderRadius: "8px",
                  padding: "1.5% 4%",
                  fontSize: "clamp(10px, 2vw, 12px)",
                  fontWeight: "500",
                  fontFamily: "'DM Mono', monospace",
                  alignSelf: "flex-start",
                  whiteSpace: "nowrap",
                }}>
                  {data.passengerList?.[0]?.currentStatus || "—"}
                </div>
              </div>

              {/* Route */}
              <div className="pnr-route">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: "600", color: "#f1f5f9", fontFamily: "'DM Mono', monospace", letterSpacing: "-0.02em" }}>
                    {data.sourceStation}
                  </div>
                  <div style={{ fontSize: "clamp(9px, 1.8vw, 11px)", color: "#475569", marginTop: "2%" }}>Boarding point</div>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "clamp(9px, 1.8vw, 11px)", color: "#334155", marginBottom: "6%" }}>{data.distance} km</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "3%" }}>
                    <div style={{ flex: 1, height: "0.5px", background: "rgba(99,102,241,0.4)" }} />
                    <span style={{ color: "#6366f1", fontSize: "clamp(12px, 2.5vw, 14px)" }}>✈</span>
                    <div style={{ flex: 1, height: "0.5px", background: "rgba(99,102,241,0.4)" }} />
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <div style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: "600", color: "#f1f5f9", fontFamily: "'DM Mono', monospace", letterSpacing: "-0.02em" }}>
                    {data.destinationStation}
                  </div>
                  <div style={{ fontSize: "clamp(9px, 1.8vw, 11px)", color: "#475569", marginTop: "2%" }}>Destination</div>
                </div>
              </div>
            </div>

            {/* Journey Details Grid */}
            <div className="pnr-grid-detail" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
              {[
                { label: "Departure",    value: formatDate(data.dateOfJourney), sub: formatTime(data.dateOfJourney) },
                { label: "Arrival",      value: formatDate(data.arrivalDate),   sub: formatTime(data.arrivalDate) },
                { label: "Booked on",    value: formatDate(data.bookingDate),   sub: null },
                { label: "Chart status", value: data.chartStatus,               sub: null },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: "4% 5%",
                  borderRight: i % 2 === 0 ? "0.5px solid rgba(255,255,255,0.06)" : "none",
                  borderBottom: i < 2 ? "0.5px solid rgba(255,255,255,0.06)" : "none",
                }}>
                  <div style={{ fontSize: "clamp(9px, 1.8vw, 10px)", color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4%" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "clamp(11px, 2.5vw, 14px)", fontWeight: "500", color: "#cbd5e1" }}>{item.value}</div>
                  {item.sub && <div style={{ fontSize: "clamp(9px, 1.8vw, 11px)", color: "#475569", marginTop: "2%" }}>{item.sub}</div>}
                </div>
              ))}
            </div>

            {/* Passenger List */}
            <div style={{ padding: "3% 4%" }}>
              <div style={{ fontSize: "clamp(9px, 1.8vw, 10px)", color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3%" }}>
                Passengers · {data.numberOfpassenger}
              </div>
              {data.passengerList?.map((p, i) => {
                const s = getStatusStyle(p.currentStatus);
                return (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "2%",
                    background: "rgba(255,255,255,0.02)",
                    border: "0.5px solid rgba(255,255,255,0.06)",
                    borderRadius: "12px",
                    padding: "3% 4%",
                    marginBottom: "2.5%",
                  }}>
                    <div style={{ flex: 1, minWidth: "55%" }}>
                      <div style={{ fontSize: "clamp(11px, 2.5vw, 14px)", fontWeight: "500", color: "#cbd5e1" }}>
                        Passenger {p.passengerSerialNumber}
                      </div>
                      <div style={{ fontSize: "clamp(9px, 1.8vw, 11px)", color: "#475569", marginTop: "2%" }}>
                        Booked: {p.bookingStatusDetails} · Quota: {p.passengerQuota}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        background: s.bg, color: s.text,
                        border: `0.5px solid ${s.border}`,
                        borderRadius: "8px",
                        padding: "1.5% 4%",
                        fontSize: "clamp(10px, 2vw, 12px)",
                        fontFamily: "'DM Mono', monospace",
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                      }}>
                        {p.currentStatusDetails || p.currentStatus}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tags */}
            <div className="pnr-tags">
              {[
                { k: "Ticket type",   v: data.ticketTypeInPrs === "E" ? "E-Ticket" : data.ticketTypeInPrs },
                { k: "Vikalp",        v: data.vikalpStatus },
                { k: "Boarding",      v: data.boardingPoint },
                { k: "Reserved upto", v: data.reservationUpto },
              ].map((tag, i) => (
                <span key={i} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "0.5px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "1.5% 3%",
                  fontSize: "clamp(9px, 2vw, 12px)",
                  color: "#475569",
                  marginBottom: "2%",
                  whiteSpace: "nowrap",
                }}>
                  {tag.k}: <span style={{ color: "#94a3b8", fontWeight: "500" }}>{tag.v}</span>
                </span>
              ))}
            </div>

            {/* Fare */}
            <div className="pnr-fare-row">
              <div>
                <div style={{ fontSize: "clamp(9px, 1.8vw, 11px)", color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Booking fare
                </div>
                <div style={{ fontSize: "clamp(16px, 4vw, 22px)", fontWeight: "600", color: "#f1f5f9", letterSpacing: "-0.02em", marginTop: "2%" }}>
                  ₹{data.bookingFare?.toLocaleString("en-IN")}
                </div>
              </div>
              {data.ticketFare === 0 && (
                <div style={{
                  background: "rgba(74,222,128,0.08)",
                  border: "0.5px solid rgba(74,222,128,0.2)",
                  borderRadius: "8px",
                  padding: "2% 4%",
                  fontSize: "clamp(10px, 2vw, 12px)",
                  color: "#4ade80",
                  whiteSpace: "nowrap",
                }}>
                  Refund processed
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div style={{ padding: "2% 4% 3%", textAlign: "right" }}>
              <span style={{ fontSize: "clamp(9px, 1.8vw, 10px)", color: "#1e293b" }}>
                Last updated · {data.timeStamp}
              </span>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}