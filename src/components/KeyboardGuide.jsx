import React from "react";

const KeyboardGuide = ({ activeKey }) => {
  const rows = [
    ["~", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Back"],
    ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
    ["Caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter"],
    ["L-Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "R-Shift"],
    ["Ctrl", "Win", "Alt", "Space", "Alt", "Win", "Ctrl"],
  ];

  const leftSideKeys = ["~", "`", "1", "!", "2", "@", "3", "#", "4", "$", "5", "%", "Q", "W", "E", "R", "T", "A", "S", "D", "F", "G", "Z", "X", "C", "V", "B"];
  
  const getKeySide = (key) => {
    if (!key) return null;
    return leftSideKeys.includes(key.toUpperCase()) ? "left" : "right";
  };

  const getBaseKey = (key) => {
    if (!key) return null;
    const shiftMap = {
      "!": "1", "@": "2", "#": "3", "$": "4", "%": "5",
      "^": "6", "&": "7", "*": "8", "(": "9", ")": "0",
      "_": "-", "+": "=", "{": "[", "}": "]", "|": "\\",
      ":": ";", "\"": "'", "<": ",", ">": ".", "?": "/",
      "`": "~"
    };
    return shiftMap[key] || key;
  };

  const isShifted = activeKey?.length === 1 && /[A-Z!@#$%^&*()_+{}|:"<>?~]/.test(activeKey);
  const baseActiveKey = getBaseKey(activeKey);
  const activeKeySide = getKeySide(activeKey);

  const getFingerForKey = (key) => {
    const keyMap = {
      "left-pinky": ["~", "1", "Q", "A", "Z", "Caps", "L-Shift", "Tab"],
      "left-ring": ["2", "W", "S", "X"],
      "left-middle": ["3", "E", "D", "C"],
      "left-index": ["4", "5", "R", "T", "F", "G", "V", "B"],
      thumbs: ["Space", " "],
      "right-index": ["6", "7", "Y", "U", "H", "J", "N", "M"],
      "right-middle": ["8", "I", "K", ","],
      "right-ring": ["9", "O", "L", "."],
      "right-pinky": [
        "0",
        "-",
        "=",
        "P",
        "[",
        "]",
        "\\",
        ";",
        "'",
        "Enter",
        "/",
        "R-Shift",
        "Back",
      ],
    };

    const k = key?.toUpperCase();
    for (const [finger, keys] of Object.entries(keyMap)) {
      if (keys.includes(k) || keys.includes(key)) return finger;
    }
    return null;
  };

  const getActiveFingers = () => {
    const fingers = [];
    if (!activeKey) return fingers;
    
    // Primary key finger
    const primaryFinger = getFingerForKey(baseActiveKey);
    if (primaryFinger) fingers.push(primaryFinger);
    
    // Shift finger if needed
    if (isShifted) {
      if (activeKeySide === "left") {
        fingers.push("right-pinky"); // Use Right Shift for left keys
      } else {
        fingers.push("left-pinky"); // Use Left Shift for right keys
      }
    }
    
    return fingers;
  };

  const activeFingers = getActiveFingers();

  const getKeyStyle = (key) => {
    const isTargetShift = (isShifted && activeKeySide === "left" && key === "R-Shift") || 
                          (isShifted && activeKeySide === "right" && key === "L-Shift");

    const isActive =
      baseActiveKey?.toUpperCase() === key.toUpperCase() ||
      (baseActiveKey === " " && key === "Space") ||
      isTargetShift;

    let width = "52px";
    if (key === "Space") width = "360px";
    if (key === "Back" || key === "Tab") width = "80px";
    if (key === "Caps" || key === "Enter") width = "90px";
    if (key === "L-Shift" || key === "R-Shift") width = "115px";
    if (key === "Ctrl" || key === "Win" || key === "Alt") width = "70px";

    return {
      width,
      height: "46px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "8px",
      background: isActive
        ? "linear-gradient(180deg, #4ade80 0%, #22c55e 100%)"
        : "linear-gradient(180deg, #334155 0%, #1e293b 100%)",
      border: isActive ? "1px solid #86efac" : "1px solid #475569",
      borderBottom: isActive ? "4px solid #16a34a" : "4px solid #0f172a",
      color: isActive ? "#064e3b" : "#f1f5f9",
      fontSize: "0.7rem",
      fontWeight: "700",
      transition: "all 0.05s ease",
      boxShadow: isActive
        ? "0 0 15px rgba(74, 222, 128, 0.5)"
        : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      transform: isActive ? "translateY(2px)" : "none",
      position: "relative",
      margin: "1px",
      zIndex: 1,
    };
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0f172a",
        borderTop: "1px solid #334155",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* SIDE REFERENCE: PHOTO-REALISTIC LEFT HAND */}
      <div
        style={{
          width: "220px",
          height: "300px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity:
            activeFingers.length === 0 ||
            activeFingers.some(f => f.startsWith("left") || f === "thumbs")
              ? 1.0
              : 0.2,
          transition: "opacity 0.3s ease",
        }}
      >
        <p
          style={{
            color: "#94a3b8",
            fontSize: "0.75rem",
            fontWeight: "bold",
            marginBottom: "10px",
            letterSpacing: "1px",
          }}
        >
          LEFT HAND
        </p>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <img
            src="/realistic_left_hand_v2.png"
            alt="Left Hand"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "brightness(0.9) contrast(1.1)",
              mixBlendMode: "lighten",
              transform: "scaleX(-1)",
            }}
          />
          <ReferenceHighlights side="left" activeFingers={activeFingers} activeKey={activeKey} isShifted={isShifted} activeKeySide={activeKeySide} />
        </div>
      </div>

      {/* Keyboard Center Chassis */}
      <div
        style={{
          background: "#1e293b",
          padding: "12px",
          borderRadius: "16px",
          boxShadow:
            "inset 0 2px 4px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.5)",
          border: "1px solid #334155",
          position: "relative",
          margin: "0 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {rows.map((row, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: "2px", justifyContent: "center" }}
            >
              {row.map((key, j) => (
                <div key={`${i}-${j}`} style={getKeyStyle(key)}>
                  <span
                    style={{
                      position: "absolute",
                      top: "4px",
                      left: "6px",
                      opacity: 0.6,
                      fontSize: "0.6rem",
                    }}
                  >
                    {key.length === 1 ? key : ""}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      opacity: key.length === 1 ? 0 : 1,
                    }}
                  >
                    {key}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* STYLIZED SVG HAND OVERLAY */}
        <svg
          style={{
            position: "absolute",
            top: "-20px",
            left: "12px",
            width: "780px",
            height: "360px",
            pointerEvents: "none",
            overflow: "visible",
            zIndex: 20,
          }}
          viewBox="0 0 780 360"
        >
          <defs>
            <filter id="fingerGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="fingerGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(180, 140, 100, 0)" />
              <stop offset="20%" stopColor="rgba(210, 160, 120, 0.4)" />
              <stop offset="100%" stopColor="rgba(230, 180, 140, 0.6)" />
            </linearGradient>
          </defs>

          {/* LEFT HAND */}
          <Finger side="left" active={activeFingers.includes("left-pinky")} path="M116,350 C110,270 100,220 116,160" />
          <Finger side="left" active={activeFingers.includes("left-ring")} path="M168,350 C165,260 160,200 168,160" />
          <Finger side="left" active={activeFingers.includes("left-middle")} path="M220,350 C218,250 215,200 220,160" />
          <Finger side="left" active={activeFingers.includes("left-index")} path="M272,350 C275,260 280,200 272,160" />
          <Finger side="left" active={activeFingers.includes("thumbs")} path="M320,350 C340,320 360,300 375,250" />

          {/* RIGHT HAND */}
          <Finger side="right" active={activeFingers.includes("right-index")} path="M508,350 C505,260 500,200 508,160" />
          <Finger side="right" active={activeFingers.includes("right-middle")} path="M560,350 C562,250 565,200 560,160" />
          <Finger side="right" active={activeFingers.includes("right-ring")} path="M612,350 C615,260 620,200 612,160" />
          <Finger side="right" active={activeFingers.includes("right-pinky")} path="M664,350 C670,270 680,220 664,160" />
          <Finger side="right" active={activeFingers.includes("thumbs")} path="M460,350 C440,320 420,300 405,250" />
        </svg>
      </div>

      {/* SIDE REFERENCE: PHOTO-REALISTIC RIGHT HAND */}
      <div
        style={{
          width: "220px",
          height: "300px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity:
            activeFingers.length === 0 ||
            activeFingers.some(f => f.startsWith("right") || f === "thumbs")
              ? 1.0
              : 0.2,
          transition: "opacity 0.3s ease",
        }}
      >
        <p
          style={{
            color: "#94a3b8",
            fontSize: "0.75rem",
            fontWeight: "bold",
            marginBottom: "10px",
            letterSpacing: "1px",
          }}
        >
          RIGHT HAND
        </p>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <img
            src="/realistic_right_hand_v2.png"
            alt="Right Hand"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "brightness(0.9) contrast(1.1)",
              mixBlendMode: "lighten",
              transform: "scaleX(-1)",
            }}
          />
          <ReferenceHighlights side="right" activeFingers={activeFingers} activeKey={activeKey} isShifted={isShifted} activeKeySide={activeKeySide} />
        </div>
      </div>
    </div>
  );
};

const ReferenceHighlights = ({ side, activeFingers, activeKey, isShifted, activeKeySide }) => {
  const getPos = (finger) => {
    const positions = {
      left: {
        thumb: { top: "30%", left: "75%" },
        index: { top: "15%", left: "60%" },
        middle: { top: "14%", left: "44%" },
        ring: { top: "18%", left: "29%" },
        pinky: { top: "25%", left: "17%" },
      },
      right: {
        index: { top: "18%", left: "14%" },
        middle: { top: "14%", left: "28%" },
        ring: { top: "15%", left: "43%" },
        pinky: { top: "18%", left: "57%" },
        thumb: { top: "38%", left: "10%" },
      },
    };
    return positions[side][finger];
  };

  return (
    <>
      {["pinky", "ring", "middle", "index", "thumb"].map((f) => {
        const fingerName = `${side}-${f}`;
        const isActive = activeFingers.includes(fingerName) || (activeFingers.includes("thumbs") && f === "thumb");
        
        // Determine what label to show inside the dot
        let label = "";
        if (isActive) {
          const isShiftFinger = (isShifted && activeKeySide === "left" && fingerName === "right-pinky") || 
                                (isShifted && activeKeySide === "right" && fingerName === "left-pinky");
          
          if (isShiftFinger) {
            label = "SH";
          } else if (activeKey === "Back") {
             label = "BK";
          } else {
            label = activeKey?.toUpperCase() === "SPACE" ? "SP" : activeKey?.toUpperCase();
          }
        }

        const pos = getPos(f);
        return (
          <div
            key={f}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: isActive ? "#4ade80" : "rgba(255,255,255,0.05)",
              border: isActive ? "2px solid white" : "1px solid rgba(255,255,255,0.1)",
              boxShadow: isActive ? "0 0 25px #4ade80" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              transition: "all 0.3s ease",
            }}
          >
            <span style={{ 
              fontSize: "8px", 
              fontWeight: "900", 
              color: isActive ? "#064e3b" : "transparent",
              pointerEvents: "none"
            }}>
              {label}
            </span>
          </div>
        );
      })}
    </>
  );
};

const Finger = ({ path, active }) => (
  <path
    d={path}
    fill="none"
    stroke={active ? "rgba(74, 222, 128, 0.8)" : "url(#fingerGradient)"}
    strokeWidth="36"
    strokeLinecap="round"
    filter={active ? "url(#fingerGlow)" : ""}
    style={{
      transition: "all 0.2s ease",
      strokeOpacity: active ? 1 : 0.4,
      mixBlendMode: "plus-lighter",
    }}
  />
);

export default KeyboardGuide;
