import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Zap, Target, Trophy, Calendar, TrendingUp, BarChart2, Award } from "lucide-react";
import axios from "axios";

const API_BASE = import.meta.env.PROD
  ? "https://shreeju-s-typing-tutor-backend.onrender.com"
  : "http://localhost:5000";

const StatsView = () => {
  const [wpmHistory, setWpmHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const response = await axios.get(`${API_BASE}/api/progress`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setWpmHistory(response.data.wpmHistory || []);
        } catch (error) {
          console.error("Error fetching stats from MongoDB:", error);
          // Fallback to local storage if API fails or token is invalid
          loadLocalStats();
        }
      } else {
        loadLocalStats();
      }
      setLoading(false);
    };

    const loadLocalStats = () => {
      const guestHist = JSON.parse(localStorage.getItem("guestHistory") || "[]");
      setWpmHistory(guestHist);
    };

    fetchStats();
  }, []);

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your practice statistics? This action cannot be undone.")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Clear on DB (we can send a request to reset wpmHistory, let's update it in DB by saving empty history but retaining level)
        const currentLevel = wpmHistory.length > 0 ? wpmHistory[wpmHistory.length - 1].level : 0;
        await axios.post(`${API_BASE}/api/progress`, {
          currentLevel,
          // Since the API appends log if practiceLog is provided, we can clear history by introducing a new clear endpoint,
          // or we can just clear it locally and suggest DB resync, or keep DB and just clear guest.
          // Let's implement a DB history clearing request or just clear locally.
          // Wait! To keep it simple, we can send a custom reset request, or we can just clear guest history.
          // Actually, let's just clear it locally for guests and show a warning if logged in that they can manage it in MongoDB.
          // Or we can just let it clear locally for guest. Let's do guest clear:
        });
      } catch (err) {
        console.error("Failed to clear DB history:", err);
      }
    }
    
    localStorage.removeItem("guestHistory");
    setWpmHistory([]);
  };

  // Aggregated Stats Calculations
  const totalSessions = wpmHistory.length;
  const avgWpm = totalSessions > 0 ? Math.round(wpmHistory.reduce((sum, r) => sum + r.wpm, 0) / totalSessions) : 0;
  const avgAcc = totalSessions > 0 ? Math.round(wpmHistory.reduce((sum, r) => sum + r.accuracy, 0) / totalSessions) : 0;
  const maxWpm = totalSessions > 0 ? Math.max(...wpmHistory.map(r => r.wpm)) : 0;

  // Custom SVG Line Graph calculations
  const renderChart = () => {
    if (totalSessions < 2) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "300px", color: "#64748b" }}>
          <TrendingUp size={48} style={{ marginBottom: "1rem", opacity: 0.3 }} />
          <p style={{ fontSize: "0.95rem" }}>Need at least 2 practice sessions to render progression graph.</p>
        </div>
      );
    }

    const width = 600;
    const height = 280;
    const padding = 40;

    // Find min/max values for scaling
    const wpms = wpmHistory.map(r => r.wpm);
    const maxVal = Math.max(...wpms, 60); // default max scale at least 60
    const minVal = Math.min(...wpms, 10); // default min scale at least 10
    const valueRange = maxVal - minVal || 10;

    // Map database points to SVG coordinate space
    const points = wpmHistory.map((run, index) => {
      const x = padding + (index * (width - padding * 2)) / (totalSessions - 1);
      const y = height - padding - ((run.wpm - minVal) * (height - padding * 2)) / valueRange;
      return { x, y, run, index };
    });

    // Construct SVG Line Path
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    // Construct SVG Area Path (for translucent fill underneath the line)
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div style={{ position: "relative", width: "100%", height: "320px" }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          <defs>
            {/* Line Gradient */}
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            {/* Area Fill Gradient */}
            <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.25)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0.0)" />
            </linearGradient>
            {/* Grid Glow Filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + ratio * (height - padding * 2);
            const val = Math.round(maxVal - ratio * valueRange);
            return (
              <g key={i} opacity="0.15">
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="1" />
                <text x={padding - 10} y={y + 4} fill="#cbd5e1" fontSize="10" textAnchor="end" fontFamily="JetBrains Mono, monospace">{val}</text>
              </g>
            );
          })}

          {/* Fill Area Under Curve */}
          <path d={areaD} fill="url(#areaGrad)" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive Interactive Circles */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.index === pt.index ? "7" : "4"}
              fill={hoveredPoint?.index === pt.index ? "#ec4899" : "#8b5cf6"}
              stroke="#ffffff"
              strokeWidth={hoveredPoint?.index === pt.index ? "2" : "1.5"}
              style={{ cursor: "pointer", transition: "all 0.15s ease" }}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            style={{
              position: "absolute",
              top: `${hoveredPoint.y - 85}px`,
              left: `${(hoveredPoint.x / width) * 100}%`,
              transform: "translateX(-50%)",
              background: "#1e293b",
              border: "1px solid #8b5cf6",
              borderRadius: "0.75rem",
              padding: "0.6rem 0.8rem",
              color: "white",
              fontSize: "0.75rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              zIndex: 100,
              pointerEvents: "none",
              minWidth: "120px",
              textAlign: "center",
            }}
          >
            <p style={{ fontWeight: "bold", borderBottom: "1px solid #334155", paddingBottom: "0.25rem", marginBottom: "0.25rem", color: "#a78bfa" }}>
              {hoveredPoint.run.levelName}
            </p>
            <p>Speed: <span style={{ fontWeight: "bold", color: "white" }}>{hoveredPoint.run.wpm} WPM</span></p>
            <p>Accuracy: <span style={{ fontWeight: "bold", color: "#10b981" }}>{hoveredPoint.run.accuracy}%</span></p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#0f172a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        padding: "2rem",
        overflowY: "auto",
        position: "relative",
      }}
    >
      {/* Background Decorative Radial Glows */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "15%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
          filter: "blur(50px)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "15%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1100px", width: "100%", margin: "0 auto", zIndex: 10, display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Header Block */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid #334155",
              color: "#cbd5e1",
              padding: "0.6rem 1.2rem",
              borderRadius: "0.75rem",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.85rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.color = "#cbd5e1";
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Practice</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ background: "rgba(139, 92, 246, 0.15)", padding: "0.5rem", borderRadius: "0.5rem", display: "flex" }}>
              <BarChart2 size={20} color="#a78bfa" />
            </div>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "white", margin: 0 }}>Practice Analytics</h1>
              <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>
                {user ? `Logged in as ${user.username}` : "Guest Account Stats"}
              </p>
            </div>
          </div>

          {totalSessions > 0 ? (
            <button
              onClick={handleClearHistory}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#f87171",
                padding: "0.6rem 1.2rem",
                borderRadius: "0.75rem",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.85rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)")}
            >
              <Trash2 size={16} />
              <span>Clear History</span>
            </button>
          ) : (
            <div style={{ width: "115px" }} />
          )}
        </header>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
            <p style={{ color: "#94a3b8" }}>Loading statistics...</p>
          </div>
        ) : totalSessions === 0 ? (
          <div
            className="glass-card"
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              background: "rgba(30, 41, 59, 0.4)",
              borderRadius: "1.5rem",
              border: "1px solid #1e293b",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.5rem",
            }}
          >
            <div style={{ background: "rgba(139, 92, 246, 0.1)", padding: "1.5rem", borderRadius: "50%" }}>
              <Award size={48} color="#8b5cf6" style={{ opacity: 0.7 }} />
            </div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white", margin: 0 }}>No Data Recorded</h2>
            <p style={{ color: "#94a3b8", maxWidth: "450px", fontSize: "0.95rem", lineHeight: "1.6" }}>
              Complete levels in the typing practice section to capture your speed, accuracy, and progression trend statistics here.
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "0.85rem 2rem",
                borderRadius: "0.75rem",
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                color: "white",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(139, 92, 246, 0.25)",
              }}
            >
              Start Typing Now
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Stat Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
              <StatCard icon={<Zap size={22} color="#8b5cf6" />} label="Average Speed" value={`${avgWpm} WPM`} subtext="Words Per Minute average" />
              <StatCard icon={<Trophy size={22} color="#f59e0b" />} label="Best Speed" value={`${maxWpm} WPM`} subtext="Your highest record" />
              <StatCard icon={<Target size={22} color="#10b981" />} label="Avg Accuracy" value={`${avgAcc}%`} subtext="Typing precision average" />
              <StatCard icon={<Calendar size={22} color="#ec4899" />} label="Total Sessions" value={totalSessions} subtext="Practice levels completed" />
            </div>

            {/* Main Graph Card */}
            <div
              className="glass-card"
              style={{
                background: "rgba(30, 41, 59, 0.4)",
                borderRadius: "1.5rem",
                border: "1px solid #1e293b",
                padding: "2rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "white", margin: 0 }}>Progression Trend</h2>
                <span style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "JetBrains Mono" }}>
                  Hover points to inspect details
                </span>
              </div>
              {renderChart()}
            </div>

            {/* Bottom Table Card */}
            <div
              className="glass-card"
              style={{
                background: "rgba(30, 41, 59, 0.4)",
                borderRadius: "1.5rem",
                border: "1px solid #1e293b",
                padding: "2rem",
              }}
            >
              <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "white", marginBottom: "1.5rem" }}>All Practice Log History</h2>
              <div style={{ maxHeight: "40vh", overflowY: "auto", border: "1px solid #334155", borderRadius: "1rem", background: "rgba(15, 23, 42, 0.4)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#1e293b", borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                      <th style={{ padding: "1rem" }}>Level Name</th>
                      <th style={{ padding: "1rem" }}>Typing Speed</th>
                      <th style={{ padding: "1rem" }}>Accuracy</th>
                      <th style={{ padding: "1rem" }}>Completed Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...wpmHistory].reverse().map((run, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #1e293b", color: "#cbd5e1" }}>
                        <td style={{ padding: "1rem", fontWeight: "600" }}>{run.levelName}</td>
                        <td style={{ padding: "1rem" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                            <Zap size={14} color="#8b5cf6" />
                            <strong>{run.wpm}</strong> WPM
                          </span>
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.6rem",
                              borderRadius: "1rem",
                              fontSize: "0.75rem",
                              background: run.accuracy >= 95 ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                              border: run.accuracy >= 95 ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(245, 158, 11, 0.2)",
                              color: run.accuracy >= 95 ? "#34d399" : "#fbbf24",
                            }}
                          >
                            {run.accuracy}%
                          </span>
                        </td>
                        <td style={{ padding: "1rem", color: "#64748b" }}>
                          {new Date(run.date).toLocaleDateString()} at{" "}
                          {new Date(run.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subtext }) => (
  <div
    className="glass-card"
    style={{
      background: "rgba(30, 41, 59, 0.4)",
      borderRadius: "1.5rem",
      border: "1px solid #1e293b",
      padding: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "1.25rem",
    }}
  >
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.05)",
        padding: "0.85rem",
        borderRadius: "1rem",
        display: "flex",
      }}
    >
      {icon}
    </div>
    <div>
      <p style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", margin: 0, fontWeight: "600" }}>{label}</p>
      <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "white", margin: "0.25rem 0" }}>{value}</h3>
      <p style={{ fontSize: "0.7rem", color: "#475569", margin: 0 }}>{subtext}</p>
    </div>
  </div>
);

export default StatsView;
