import { useTypingViewModel } from "../viewmodels/TypingViewModel";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import KeyboardGuide from "../components/KeyboardGuide";
import {
  Trophy,
  RotateCcw,
  Zap,
  Target,
  ChevronRight,
  BookOpen,
  Clock,
  CaseLower,
  CaseSensitive,
  Loader2,
  ChevronDown,
  HelpCircle,
  X,
  Info,
  Fingerprint,
  TrendingUp,
  Globe,
  Volume2,
  VolumeX,
  LogIn,
  LogOut,
  Cloud,
  CloudOff,
  Lock,
  BarChart2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TypingPractice = () => {
  const vm = useTypingViewModel();
  const inputRef = useRef(null);
  const activeCharRef = useRef(null);
  const [showTimeOptions, setShowTimeOptions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeCharRef.current) {
      activeCharRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [vm.userInput]);
  const [showGuide, setShowGuide] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth < 640);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const audioCtxRef = useRef(null);

  const playTypingSound = () => {
    if (!isSoundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Use a square wave with a higher frequency for a crisp, audible "click"
      // that works well on laptop/phone speakers.
      osc.type = "square";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.03);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.03);
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsSmallMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keep input focused at all times
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current && !vm.isFinished && !showGuide) {
        inputRef.current.focus();
      }
    };

    // Use a small timeout to ensure the DOM has updated and
    // the input is no longer disabled before trying to focus
    const timeoutId = setTimeout(focusInput, 50);

    // Global click listener to re-focus if user clicks anywhere
    window.addEventListener("click", focusInput);

    // Global keydown listener to capture focus if user starts typing
    const handleGlobalKeyDown = (e) => {
      if (inputRef.current && !vm.isFinished && !showGuide) {
        // Only focus if not already focused and not on another input/button
        if (
          document.activeElement !== inputRef.current &&
          document.activeElement.tagName !== "INPUT" &&
          document.activeElement.tagName !== "BUTTON" &&
          document.activeElement.tagName !== "TEXTAREA"
        ) {
          inputRef.current.focus();
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("click", focusInput);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [vm.currentLevel, vm.isFinished, showGuide]);

  if (isSmallMobile) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          padding: "2rem",
          textAlign: "center",
          color: "white",
        }}
      >
        <div
          style={{
            background: "rgba(139, 92, 246, 0.1)",
            padding: "2rem",
            borderRadius: "2rem",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            maxWidth: "320px",
          }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <HelpCircle size={48} color="#8b5cf6" />
          </div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Desktop Experience Required
          </h2>
          <p
            style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: "1.6" }}
          >
            This typing tutor is designed for physical keyboards to help you
            master touch-typing.
            <br />
            <br />
            Please visit us on a{" "}
            <span style={{ color: "white", fontWeight: "bold" }}>
              Laptop, Computer, or Tablet
            </span>{" "}
            to begin your practice.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        background: "#0f172a",
        position: "relative",
      }}
    >
      {/* Top 60% - Practice Area */}
      <div
        style={{
          height: isMobile ? "auto" : "60vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: isSmallMobile ? "1rem" : "1.5rem 2rem",
          gap: "1rem",
          zIndex: 10,
          borderBottom: "1px solid #1e293b",
        }}
      >
        <header
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            gap: "1.5rem",
            marginBottom: isMobile ? "0.5rem" : "0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                background: "var(--primary)",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                display: "flex",
              }}
            >
              <BookOpen size={20} color="white" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "white",
                  margin: 0,
                }}
              >
                {vm.currentLevelName}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  Practice {vm.currentLevel + 1} of {vm.practices.length}
                </span>
                {vm.user ? (
                  <span style={{ fontSize: "0.65rem", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34d399", padding: "1px 6px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                    <Cloud size={10} /> Cloud Sync
                  </span>
                ) : (
                  <span
                    onClick={() => navigate("/auth")}
                    style={{ fontSize: "0.65rem", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", color: "#fbbf24", padding: "1px 6px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "2px", cursor: "pointer" }}
                    title="Click to log in and save progress"
                  >
                    <CloudOff size={10} /> Guest Mode (Save Progress)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: isSmallMobile ? "1rem" : "2rem",
              flexWrap: "wrap",
              width: isMobile ? "100%" : "auto",
            }}
          >
            <StatItem
              icon={<Zap size={18} color="#8b5cf6" />}
              label="WPM"
              value={vm.wpm}
            />
            <StatItem
              icon={<Target size={18} color="#10b981" />}
              label="Accuracy"
              value={`${vm.accuracy}%`}
            />

            {vm.timeOption && (
              <StatItem
                icon={<Clock size={18} color="#f59e0b" />}
                label="Time Left"
                value={`${vm.timeLeft}s`}
              />
            )}

            {/* Training Modes Section */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                marginLeft: isMobile ? "0" : "1rem",
                borderLeft: isMobile ? "none" : "1px solid #334155",
                paddingLeft: isMobile ? "0" : "1.5rem",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => vm.fetchInformativeText("small")}
                disabled={vm.isLoading}
                className="glass-card"
                style={{
                  padding: "0.4rem 0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid #334155",
                  color: "white",
                }}
              >
                {vm.isLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <CaseLower size={12} color="#8b5cf6" />
                )}
                <span style={{ fontSize: "0.7rem" }}>Small Case</span>
              </button>

              <button
                onClick={() => vm.fetchInformativeText("mixed")}
                disabled={vm.isLoading}
                className="glass-card"
                style={{
                  padding: "0.4rem 0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid #334155",
                  color: "white",
                }}
              >
                {vm.isLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <CaseSensitive size={12} color="#8b5cf6" />
                )}
                <span style={{ fontSize: "0.7rem" }}>Mixed Case</span>
              </button>

              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowTimeOptions(!showTimeOptions)}
                  className="glass-card"
                  style={{
                    padding: "0.4rem 0.75rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    background: vm.timeOption
                      ? "rgba(139, 92, 246, 0.2)"
                      : "rgba(255,255,255,0.05)",
                    border: vm.timeOption
                      ? "1px solid #8b5cf6"
                      : "1px solid #334155",
                    color: "white",
                  }}
                >
                  <Clock size={12} color="#f59e0b" />
                  <span style={{ fontSize: "0.7rem" }}>Time</span>
                  <ChevronDown size={10} />
                </button>

                {showTimeOptions && (
                  <div
                    style={{
                      position: "absolute",
                      top: "120%",
                      right: 0,
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "0.75rem",
                      padding: "0.5rem",
                      zIndex: 100,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                      minWidth: "80px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                    }}
                  >
                    {[30, 60, 120].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => {
                          vm.setTimeOption(sec);
                          setShowTimeOptions(false);
                        }}
                        style={{
                          padding: "0.5rem",
                          background:
                            vm.timeOption === sec
                              ? "rgba(139, 92, 246, 0.2)"
                              : "transparent",
                          border: "none",
                          color: vm.timeOption === sec ? "#a78bfa" : "white",
                          cursor: "pointer",
                          borderRadius: "0.4rem",
                          fontSize: "0.75rem",
                          textAlign: "left",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.background = "rgba(255,255,255,0.05)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background =
                            vm.timeOption === sec
                              ? "rgba(139, 92, 246, 0.2)"
                              : "transparent")
                        }
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowGuide(true)}
                className="glass-card"
                style={{
                  padding: "0.4rem 0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid #334155",
                  color: "white",
                }}
              >
                <HelpCircle size={12} color="#8b5cf6" />
                <span style={{ fontSize: "0.7rem" }}>Guide</span>
              </button>

              <button
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className="glass-card"
                style={{
                  padding: "0.4rem 0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: isSoundEnabled
                    ? "rgba(139, 92, 246, 0.2)"
                    : "rgba(255,255,255,0.05)",
                  border: isSoundEnabled
                    ? "1px solid #8b5cf6"
                    : "1px solid #334155",
                  color: "white",
                }}
              >
                {isSoundEnabled ? (
                  <Volume2 size={12} color="#8b5cf6" />
                ) : (
                  <VolumeX size={12} color="#94a3b8" />
                )}
                <span style={{ fontSize: "0.7rem" }}>Sound</span>
              </button>

              <button
                onClick={() => navigate("/stats")}
                className="glass-card"
                style={{
                  padding: "0.4rem 0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid #334155",
                  color: "white",
                }}
              >
                <BarChart2 size={12} color="#8b5cf6" />
                <span style={{ fontSize: "0.7rem" }}>Stats</span>
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {vm.user ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  background: "rgba(139, 92, 246, 0.1)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "0.75rem",
                  marginRight: "0.25rem",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "white" }}>
                    {vm.user.username}
                  </span>
                  <span style={{ fontSize: "0.6rem", color: "#10b981", display: "flex", alignItems: "center", gap: "2px" }}>
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#10b981" }} />
                    Synced
                  </span>
                </div>
                <button
                  onClick={vm.logout}
                  title="Logout"
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "0.5rem",
                    padding: "0.3rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f87171",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)")}
                >
                  <LogOut size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="glass-card"
                style={{
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  border: "1px solid #8b5cf6",
                  background: "rgba(139, 92, 246, 0.1)",
                  color: "#a78bfa",
                  fontWeight: "bold",
                  marginRight: "0.25rem",
                }}
              >
                <LogIn size={14} />
                <span style={{ fontSize: "0.85rem" }}>Login</span>
              </button>
            )}
            <button
              onClick={vm.reset}
              className="glass-card"
              style={{
                padding: "0.5rem 1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                border: "1px solid #334155",
              }}
            >
              <RotateCcw size={16} />
              <span style={{ fontSize: "0.85rem" }}>Reset</span>
            </button>
            <button
              onClick={vm.nextLevel}
              className="glass-card"
              style={{
                padding: "0.5rem 1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "var(--primary)",
                color: "white",
                border: "none",
              }}
            >
              <span style={{ fontSize: "0.85rem" }}>Next Level</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </header>

        {/* Level Selector */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            paddingBottom: "0.5rem",
            scrollbarWidth: "thin",
          }}
        >
          {vm.practices.map((ex, idx) => {
            const isLocked = idx > vm.unlockedLevel;
            return (
              <button
                key={ex.id}
                onClick={() => !isLocked && vm.setCurrentLevel(idx)}
                disabled={isLocked}
                style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: "2rem",
                  fontSize: "0.7rem",
                  whiteSpace: "nowrap",
                  cursor: isLocked ? "not-allowed" : "pointer",
                  background:
                    vm.currentLevel === idx
                      ? "rgba(139, 92, 246, 0.2)"
                      : isLocked
                        ? "rgba(255,255,255,0.01)"
                        : "rgba(255,255,255,0.05)",
                  color:
                    vm.currentLevel === idx
                      ? "#a78bfa"
                      : isLocked
                        ? "#475569"
                        : "#94a3b8",
                  border:
                    vm.currentLevel === idx
                      ? "1px solid #8b5cf6"
                      : "1px solid transparent",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  opacity: isLocked ? 0.5 : 1,
                }}
              >
                {isLocked && <Lock size={10} color="#475569" />}
                <span>{ex.name}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Instruction Hint */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "-0.5rem",
            marginTop: "0.5rem",
            opacity:
              vm.hasError || /[A-Z!@#$%^&*()_+{}|:"<>?]/.test(vm.currentChar)
                ? 1
                : 0,
            transition: "all 0.3s ease",
          }}
        >
          {(() => {
            const getFingerName = (char) => {
              if (!char) return "Correct Finger";
              const upperChar = char.toUpperCase();
              if (["Q", "A", "Z", "1", "~", "!", "`"].includes(upperChar))
                return "Left Pinky";
              if (["W", "S", "X", "2", "@"].includes(upperChar))
                return "Left Ring";
              if (["E", "D", "C", "3", "#"].includes(upperChar))
                return "Left Middle";
              if (
                ["R", "T", "F", "G", "V", "B", "4", "5", "$", "%"].includes(
                  upperChar,
                )
              )
                return "Left Index";
              if (
                ["Y", "U", "H", "J", "N", "M", "6", "7", "^", "&"].includes(
                  upperChar,
                )
              )
                return "Right Index";
              if (["I", "K", ",", "8", "*", "<"].includes(upperChar))
                return "Right Middle";
              if (["O", "L", ".", "9", "(", ">"].includes(upperChar))
                return "Right Ring";
              if (
                [
                  "P",
                  ";",
                  "'",
                  "/",
                  "[",
                  "]",
                  "\\",
                  "0",
                  "-",
                  "=",
                  ")",
                  "_",
                  "+",
                  "{",
                  "}",
                  "|",
                  ":",
                  '"',
                  "?",
                  "BACK",
                ].includes(upperChar)
              )
                return "Right Pinky";
              if (upperChar === " " || char === " ") return "Thumb";
              return "Correct Finger";
            };

            return (
              <div
                style={{
                  background: vm.hasError
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(139, 92, 246, 0.1)",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "2rem",
                  border: vm.hasError
                    ? "1px solid rgba(239, 68, 68, 0.2)"
                    : "1px solid rgba(139, 92, 246, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  color: vm.hasError ? "#f87171" : "#a78bfa",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              >
                {vm.hasError && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      borderRight: "1px solid rgba(248, 113, 113, 0.3)",
                      paddingRight: "0.75rem",
                      marginRight: "0.25rem",
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>
                      Mistake!{" "}
                      <span style={{ color: "white", fontSize: "0.75rem" }}>
                        [Backspace]
                      </span>
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Info size={14} />
                  <span>
                    {vm.userInput.length > 0 &&
                    vm.userInput[vm.userInput.length - 1] !==
                      vm.textToType[vm.userInput.length - 1] ? (
                      <>
                        Mistake! Press{" "}
                        <span style={{ color: "white" }}>Backspace</span> to
                        correct it
                      </>
                    ) : /[A-Z!@#$%^&*()_+{}|:"<>?]/.test(vm.currentChar) ? (
                      <>
                        Press{" "}
                        <span style={{ color: "white" }}>
                          {[
                            "~",
                            "`",
                            "1",
                            "!",
                            "2",
                            "@",
                            "3",
                            "#",
                            "4",
                            "$",
                            "5",
                            "%",
                            "Q",
                            "W",
                            "E",
                            "R",
                            "T",
                            "A",
                            "S",
                            "D",
                            "F",
                            "G",
                            "Z",
                            "X",
                            "C",
                            "V",
                            "B",
                          ].includes(vm.currentChar?.toUpperCase())
                            ? "Right Shift"
                            : "Left Shift"}
                        </span>{" "}
                        +{" "}
                        {vm.currentChar === " "
                          ? "Space"
                          : vm.currentChar?.toLowerCase()}
                      </>
                    ) : (
                      <>
                        Next:{" "}
                        <span style={{ color: "white" }}>
                          {vm.currentChar === " " ? "Space" : vm.currentChar}
                        </span>
                      </>
                    )}{" "}
                    with your{" "}
                    <span style={{ color: "white" }}>
                      {getFingerName(
                        vm.userInput.length > 0 &&
                          vm.userInput[vm.userInput.length - 1] !==
                            vm.textToType[vm.userInput.length - 1]
                          ? "Back"
                          : vm.currentChar,
                      )}
                    </span>
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Typing Display Area */}
        <div
          className="glass-card no-scrollbar"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: isSmallMobile ? "1rem" : "2rem",
            background: "rgba(30, 41, 59, 0.4)",
            position: "relative",
            borderRadius: "1.5rem",
            border: "1px solid #1e293b",
            minHeight: "200px",
            margin: isMobile ? "1rem 0" : "0",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: isSmallMobile
                ? vm.textToType.length > 50
                  ? "1.25rem"
                  : "2rem"
                : vm.textToType.length > 50
                  ? "1.75rem"
                  : "3.5rem",
              lineHeight: "1.6",
              fontFamily: "'JetBrains Mono', monospace",
              textAlign: "center",
              maxWidth: "1000px",
              wordWrap: "break-word",
              letterSpacing: "0.05em",
              color: "white",
              paddingBottom: "30vh",
              paddingTop: "10vh",
            }}
          >
            {vm.textToType.split("").map((char, index) => {
              let color = "rgba(255,255,255,0.08)";
              if (index < vm.userInput.length) {
                color = vm.userInput[index] === char ? "#f8fafc" : "#ef4444";
              } else if (index === vm.userInput.length) {
                color = "#8b5cf6";
              }
              return (
                <span
                  key={index}
                  ref={index === vm.userInput.length ? activeCharRef : null}
                  style={{
                    color,
                    backgroundColor:
                      index === vm.userInput.length
                        ? "rgba(139, 92, 246, 0.15)"
                        : "transparent",
                    borderRadius: "4px",
                    textDecoration:
                      index < vm.userInput.length &&
                      vm.userInput[index] !== char
                        ? "underline"
                        : "none",
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              );
            })}
          </div>

          <input
            ref={inputRef}
            autoFocus
            value={vm.userInput}
            onChange={(e) => {
              vm.handleInput(e);
            }}
            onKeyDown={(e) => {
              if (
                e.key.length === 1 ||
                e.key === "Backspace" ||
                e.key === "Enter"
              ) {
                playTypingSound();
              }
            }}
            style={{
              position: "absolute",
              opacity: 0,
              inset: 0,
              cursor: "default",
              width: "100%",
              height: "100%",
            }}
            disabled={vm.isFinished}
          />
        </div>
      </div>

      {/* Bottom 40% - Integrated Guide */}
      {!isSmallMobile && (
        <div
          style={{
            height: isMobile ? "auto" : "40vh",
            width: "100%",
            padding: isMobile ? "2rem 1rem" : "0",
          }}
        >
          <KeyboardGuide
            activeKey={
              vm.userInput.length > 0 &&
              vm.userInput[vm.userInput.length - 1] !==
                vm.textToType[vm.userInput.length - 1]
                ? "Back"
                : vm.currentChar
            }
            scale={isMobile ? 0.8 : 1}
          />
        </div>
      )}

      {/* Level Completion Modal */}
      <AnimatePresence>
        {vm.isFinished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.8)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "2rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              style={{
                background: "#1e293b",
                padding: "3rem 2.5rem 2.5rem",
                borderRadius: "2rem",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                textAlign: "center",
                boxShadow: "0 25px 70px rgba(0,0,0,0.5)",
                width: "100%",
                maxWidth: "450px",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-35px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                  padding: "1.25rem",
                  borderRadius: "50%",
                  boxShadow: "0 10px 20px rgba(139, 92, 246, 0.3)",
                  border: "4px solid #1e293b",
                }}
              >
                <Trophy size={32} color="white" />
              </div>

              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: "800",
                  marginBottom: "0.5rem",
                  color: "white",
                  marginTop: "1rem",
                }}
              >
                Practice Complete!
              </h2>
              <p
                style={{
                  color: "#94a3b8",
                  marginBottom: "2.5rem",
                  fontSize: "1rem",
                }}
              >
                Great job! Here's how you performed.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  justifyContent: "center",
                  marginBottom: "3rem",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.03)",
                    padding: "1.5rem",
                    borderRadius: "1.25rem",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      fontWeight: "600",
                      letterSpacing: "0.05em",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Speed
                  </p>
                  <p
                    style={{
                      fontSize: "2.25rem",
                      fontWeight: "800",
                      color: "white",
                      margin: 0,
                    }}
                  >
                    {vm.wpm}
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: "#64748b",
                        marginLeft: "0.25rem",
                      }}
                    >
                      WPM
                    </span>
                  </p>
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.03)",
                    padding: "1.5rem",
                    borderRadius: "1.25rem",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      fontWeight: "600",
                      letterSpacing: "0.05em",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Accuracy
                  </p>
                  <p
                    style={{
                      fontSize: "2.25rem",
                      fontWeight: "800",
                      color: "#10b981",
                      margin: 0,
                    }}
                  >
                    {vm.accuracy}%
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={vm.reset}
                  className="glass-card"
                  style={{
                    flex: 1,
                    padding: "1.25rem",
                    border: "1px solid #334155",
                    cursor: "pointer",
                    borderRadius: "1rem",
                    fontWeight: "600",
                    color: "#cbd5e1",
                    background: "rgba(255,255,255,0.02)",
                    transition: "all 0.2s",
                  }}
                >
                  Try Again
                </button>
                <button
                  onClick={vm.nextLevel}
                  style={{
                    flex: 1,
                    padding: "1.25rem",
                    background:
                      "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "1rem",
                    fontWeight: "bold",
                    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  Next Lesson
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* User Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "2rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              style={{
                background: "#1e293b",
                padding: isSmallMobile ? "2rem 1.5rem" : "3rem",
                borderRadius: isSmallMobile ? "1.5rem" : "2.5rem",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                width: isSmallMobile ? "95%" : "100%",
                maxWidth: "850px",
                maxHeight: "90vh",
                overflowY: "auto",
                position: "relative",
                boxShadow: "0 25px 70px rgba(0,0,0,0.8)",
              }}
            >
              <button
                onClick={() => setShowGuide(false)}
                style={{
                  position: "absolute",
                  top: "2rem",
                  right: "2rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  padding: "0.5rem",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={24} />
              </button>

              <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                <div
                  style={{
                    background: "rgba(139, 92, 246, 0.1)",
                    width: "60px",
                    height: "60px",
                    borderRadius: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                  }}
                >
                  <HelpCircle size={32} color="#8b5cf6" />
                </div>
                <h2
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "800",
                    color: "white",
                    marginBottom: "0.5rem",
                  }}
                >
                  Master Your Typing
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
                  Learn the basics and explore our powerful features.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "2rem",
                }}
              >
                {/* Section 1: Hand Placement */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    padding: "2rem",
                    borderRadius: "1.5rem",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <Fingerprint size={20} color="#8b5cf6" />
                    <h3
                      style={{
                        color: "white",
                        fontSize: "1.25rem",
                        fontWeight: "700",
                      }}
                    >
                      Hand Placement
                    </h3>
                  </div>
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.95rem",
                      lineHeight: "1.6",
                    }}
                  >
                    Keep your fingers on the{" "}
                    <span style={{ color: "white", fontWeight: "bold" }}>
                      Home Row
                    </span>{" "}
                    (ASDF for left hand, JKL; for right hand). Your index
                    fingers should rest on{" "}
                    <span style={{ color: "#8b5cf6", fontWeight: "bold" }}>
                      F
                    </span>{" "}
                    and{" "}
                    <span style={{ color: "#8b5cf6", fontWeight: "bold" }}>
                      J
                    </span>
                    —feel the small bumps?
                  </p>
                </div>

                {/* Section 2: Metrics */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    padding: "2rem",
                    borderRadius: "1.5rem",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <TrendingUp size={20} color="#10b981" />
                    <h3
                      style={{
                        color: "white",
                        fontSize: "1.25rem",
                        fontWeight: "700",
                      }}
                    >
                      Understanding Stats
                    </h3>
                  </div>
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.95rem",
                      lineHeight: "1.6",
                    }}
                  >
                    <span style={{ color: "white", fontWeight: "bold" }}>
                      WPM:
                    </span>{" "}
                    Average is 40 WPM. Pros hit 80+!
                    <br />
                    <span style={{ color: "white", fontWeight: "bold" }}>
                      Accuracy:
                    </span>{" "}
                    Aim for 95%+. Precision is the foundation of speed.
                  </p>
                </div>

                {/* Section 3: Features */}
                <div
                  style={{
                    gridColumn: "1 / -1",
                    background: "rgba(255,255,255,0.02)",
                    padding: "2rem",
                    borderRadius: "1.5rem",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <Zap size={20} color="#f59e0b" />
                    <h3
                      style={{
                        color: "white",
                        fontSize: "1.25rem",
                        fontWeight: "700",
                      }}
                    >
                      Powerful Features
                    </h3>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isSmallMobile
                        ? "1fr"
                        : isMobile
                          ? "1fr 1fr"
                          : "1fr 1fr 1fr",
                      gap: "1.5rem",
                    }}
                  >
                    <FeatureItem
                      icon={<BookOpen size={16} />}
                      title="Structured Levels"
                      desc="Progress from basic home row to advanced sentences."
                    />
                    <FeatureItem
                      icon={<Globe size={16} />}
                      title="Live Web Content"
                      desc="Practice with real-world informative text from Wikipedia."
                    />
                    <FeatureItem
                      icon={<Clock size={16} />}
                      title="Timed Challenges"
                      desc="Test your limits with 30, 60, or 120s sessions."
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "3.5rem", textAlign: "center" }}>
                <button
                  onClick={() => setShowGuide(false)}
                  style={{
                    padding: "1rem 3rem",
                    background: "#8b5cf6",
                    color: "white",
                    border: "none",
                    borderRadius: "1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                  }}
                >
                  Got it, let's type!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
};

const FeatureItem = ({ icon, title, desc }) => (
  <div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        color: "#8b5cf6",
        marginBottom: "0.5rem",
      }}
    >
      {icon}
      <h4 style={{ color: "white", fontSize: "0.95rem", fontWeight: "600" }}>
        {title}
      </h4>
    </div>
    <p style={{ color: "#64748b", fontSize: "0.85rem", lineHeight: "1.5" }}>
      {desc}
    </p>
  </div>
);

const StatItem = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        padding: "0.5rem",
        borderRadius: "0.5rem",
        display: "flex",
      }}
    >
      {icon}
    </div>
    <div>
      <p
        style={{
          fontSize: "0.7rem",
          color: "#94a3b8",
          textTransform: "uppercase",
          margin: 0,
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "1.1rem",
          fontWeight: "bold",
          color: "white",
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  </div>
);

export default TypingPractice;
