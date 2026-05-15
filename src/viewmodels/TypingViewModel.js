import { useState, useEffect, useCallback, useRef } from "react";
import { PRACTICES } from "../data/practices";

export const useTypingViewModel = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
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

  const finishSession = useCallback((finalInput, finalStartTime) => {
    setIsFinished(true);
    const endTime = Date.now();
    const timeInMinutes = (endTime - finalStartTime) / 60000;
    const wpmValue = Math.round(
      finalInput.length / 5 / Math.max(0.01, timeInMinutes),
    );
    setWpm(wpmValue);
  }, []);

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
    currentLevelName: PRACTICES[currentLevel].name,
    practices: PRACTICES,
    currentLevel,
    setCurrentLevel: (idx) => {
      setCurrentLevel(idx);
      setTextToType(PRACTICES[idx].text);
      setTimeOption(null);
      reset();
    },
  };
};
