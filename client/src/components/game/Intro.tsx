import { useState, useEffect, useCallback } from "react";

interface IntroProps {
  onComplete: () => void;
}

const storyLines = [
  "Long ago, the universe was whole.",
  "All dimensions existed in harmony,",
  "connected by ancient pathways of light.",
  "",
  "But one day, a great fracture occurred.",
  "The dimensions split apart,",
  "and the pathways were lost to time.",
  "",
  "Those who could travel between worlds",
  "became known as TRAVELERS.",
  "",
  "They alone held the power to",
  "restore what was broken.",
  "",
  "You are the last of them.",
  "",
  "You are... a ZETATRAVELER.",
];

export function Intro({ onComplete }: IntroProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const advanceText = useCallback(() => {
    if (isTyping) {
      setDisplayedText(storyLines[currentLine]);
      setIsTyping(false);
    } else {
      if (currentLine < storyLines.length - 1) {
        setCurrentLine(currentLine + 1);
        setDisplayedText("");
        setIsTyping(true);
      } else {
        onComplete();
      }
    }
  }, [currentLine, isTyping, onComplete]);

  useEffect(() => {
    if (!isTyping) return;

    const line = storyLines[currentLine];
    if (displayedText.length < line.length) {
      const timer = setTimeout(() => {
        setDisplayedText(line.slice(0, displayedText.length + 1));
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [displayedText, currentLine, isTyping]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "z" || e.key === "Z" || e.key === "Enter" || e.key === " ") {
        advanceText();
      }
      if (e.key === "x" || e.key === "X" || e.key === "Shift") {
        onComplete();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [advanceText, onComplete]);

  return (
    <div 
      className="w-full h-full bg-black flex flex-col items-center justify-center cursor-pointer select-none"
      onClick={advanceText}
    >
      <div 
        className="max-w-2xl text-center px-8"
        style={{ minHeight: "80px" }}
      >
        <p
          className="text-2xl text-white leading-relaxed"
          style={{ 
            fontFamily: "'Courier New', monospace",
            textShadow: storyLines[currentLine].includes("TRAVELER") 
              ? "0 0 10px #ff0, 0 0 20px #ff0" 
              : "none"
          }}
        >
          {displayedText}
          {isTyping && <span className="animate-pulse">|</span>}
        </p>
      </div>

      <div className="absolute bottom-8">
        <p 
          className="text-gray-600 text-sm"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          Press Z or click to continue... Press X to skip
        </p>
      </div>
    </div>
  );
}
