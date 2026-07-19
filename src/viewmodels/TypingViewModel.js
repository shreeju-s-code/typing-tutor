import { useState, useEffect, useCallback, useRef } from "react";
import { PRACTICES } from "../data/practices";
import axios from "axios";

const API_BASE = import.meta.env.PROD
  ? "https://shreeju-s-typing-tutor-backend.onrender.com"
  : "http://localhost:5000";

export const useTypingViewModel = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(0);
  const [textToType, setTextToType] = useState(PRACTICES[0].text);
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [timeOption, setTimeOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const [user, setUser] = useState(null);
  const [wpmHistory, setWpmHistory] = useState([]);

  const reset = useCallback(() => {
    setUserInput("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setIsFinished(false);
    if (timeOption) {
      setTimeLeft(timeOption);
    } else {
      setTimeLeft(null);
    }
  }, [timeOption]);

  // Fetch user details and progression on load
  useEffect(() => {
    const fetchProgress = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const response = await axios.get(`${API_BASE}/api/progress`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const { currentLevel: dbLevel, wpmHistory: dbHistory } = response.data;
          setUnlockedLevel(dbLevel);
          setCurrentLevel(dbLevel);
          setTextToType(PRACTICES[dbLevel].text);
          setWpmHistory(dbHistory || []);
        } catch (error) {
          console.error("Error fetching progress from MongoDB:", error);
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          }
        }
      } else {
        const guestLevel = localStorage.getItem("guestLevel");
        const guestHist = JSON.parse(localStorage.getItem("guestHistory") || "[]");
        setWpmHistory(guestHist);
        if (guestLevel) {
          const lvl = Number(guestLevel);
          setUnlockedLevel(lvl);
          setCurrentLevel(lvl);
          setTextToType(PRACTICES[lvl].text);
        }
      }
    };
    fetchProgress();
  }, []);

  const finishSession = useCallback((finalInput, finalStartTime) => {
    setIsFinished(true);
    const endTime = Date.now();
    const timeInMinutes = (endTime - finalStartTime) / 60000;
    const wpmValue = Math.round(
      finalInput.length / 5 / Math.max(0.01, timeInMinutes),
    );
    setWpm(wpmValue);

    let errorCount = 0;
    for (let i = 0; i < finalInput.length; i++) {
      if (finalInput[i] !== textToType[i]) errorCount++;
    }
    const finalAcc = Math.max(
      0,
      Math.round(
        ((finalInput.length - errorCount) / Math.max(1, finalInput.length)) * 100,
      ),
    );
    setAccuracy(finalAcc);

    const isCurrentAtMax = currentLevel === unlockedLevel;
    const nextUnlocked = isCurrentAtMax
      ? (unlockedLevel + 1) % PRACTICES.length
      : unlockedLevel;

    const token = localStorage.getItem("token");
    if (token) {
      axios.post(`${API_BASE}/api/progress`, {
        currentLevel: nextUnlocked,
        practiceLog: {
          wpm: wpmValue,
          accuracy: finalAcc,
          level: currentLevel,
          levelName: PRACTICES[currentLevel].name
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUnlockedLevel(response.data.currentLevel);
        setWpmHistory(response.data.wpmHistory || []);
      })
      .catch(err => console.error("Error syncing progress to MongoDB:", err));
    } else {
      localStorage.setItem("guestLevel", nextUnlocked);
      setUnlockedLevel(nextUnlocked);
      
      const localHistory = JSON.parse(localStorage.getItem("guestHistory") || "[]");
      const newLog = {
        wpm: wpmValue,
        accuracy: finalAcc,
        level: currentLevel,
        levelName: PRACTICES[currentLevel].name,
        date: new Date().toISOString()
      };
      const updatedHistory = [...localHistory, newLog];
      localStorage.setItem("guestHistory", JSON.stringify(updatedHistory));
      setWpmHistory(updatedHistory);
    }
  }, [currentLevel, unlockedLevel, textToType]);

  const userInputRef = useRef(userInput);
  useEffect(() => {
    userInputRef.current = userInput;
  }, [userInput]);

  useEffect(() => {
    let interval;
    if (startTime && !isFinished && timeOption) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            finishSession(userInputRef.current, startTime);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isFinished, timeOption, finishSession]);

  const fetchInformativeText = async (mode) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://en.wikipedia.org/api/rest_v1/page/random/summary",
      );
      const data = await response.json();
      let text = data.extract || "The quick brown fox jumps over the lazy dog.";

      if (mode === "small") {
        text = text.toLowerCase();
      }

      setTextToType(text);
      reset();
    } catch (error) {
      console.error("Error fetching text:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextLevel = useCallback(() => {
    const next = (currentLevel + 1) % PRACTICES.length;
    setCurrentLevel(next);
    setTextToType(PRACTICES[next].text);
    setTimeOption(null);
    reset();
  }, [currentLevel, reset]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    const guestLevel = localStorage.getItem("guestLevel");
    const lvl = guestLevel ? Number(guestLevel) : 0;
    setUnlockedLevel(lvl);
    setCurrentLevel(lvl);
    setTextToType(PRACTICES[lvl].text);
    setWpmHistory(JSON.parse(localStorage.getItem("guestHistory") || "[]"));
    reset();
  }, [reset]);

  const handleInput = (e) => {
    const value = e.target.value;
    if (isFinished) return;

    if (!startTime) setStartTime(Date.now());

    if (value.length > textToType.length) return;

    let errorCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== textToType[i]) errorCount++;
    }
    setErrors(errorCount);
    setUserInput(value);

    const currentAcc = Math.max(
      0,
      Math.round(
        ((value.length - errorCount) / Math.max(1, value.length)) * 100,
      ),
    );
    setAccuracy(currentAcc);

    if (value.length === textToType.length && !timeOption) {
      finishSession(value, startTime);
    }
  };

  const currentChar = textToType[userInput.length] || null;

  const [lastCaseMode, setLastCaseMode] = useState("mixed");

  return {
    textToType,
    userInput,
    wpm,
    accuracy,
    errors,
    isFinished,
    isLoading,
    timeLeft,
    timeOption,
    handleInput,
    reset,
    nextLevel,
    currentChar: textToType[userInput.length] || null,
    hasError: userInput.split('').some((char, i) => char !== textToType[i]),
    fetchInformativeText,
    setTimeOption: (val) => {
      setTimeOption(val);
      setTimeLeft(val);
      const nextMode = lastCaseMode === "small" ? "mixed" : "small";
      setLastCaseMode(nextMode);
      fetchInformativeText(nextMode);
    },
    currentLevelName: PRACTICES[currentLevel] ? PRACTICES[currentLevel].name : "Custom level",
    practices: PRACTICES,
    currentLevel,
    unlockedLevel,
    setCurrentLevel: (idx) => {
      if (idx > unlockedLevel) return; // Prevent selection of locked levels
      setCurrentLevel(idx);
      setTextToType(PRACTICES[idx].text);
      setTimeOption(null);
      reset();
    },
    user,
    logout,
    wpmHistory
  };
};


