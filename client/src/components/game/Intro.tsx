import { useState, useEffect, useCallback } from "react";

interface IntroProps {
  onComplete: () => void;
}

interface StoryLine {
  text: string;
  important: boolean;
}

const storyLines: StoryLine[] = [
  { text: "Long ago, the universe was whole.", important: false },
  { text: "All dimensions existed in harmony,", important: false },
  { text: "connected by ancient pathways of light.", important: false },
  { text: "", important: false },
  { text: "But one day, a great fracture occurred.", important: false },
  { text: "The dimensions split apart,", important: false },
  { text: "and the pathways were lost to time.", important: false },
  { text: "", important: false },
  { text: "Those who could travel between worlds", important: false },
  { text: "became known as TRAVELERS.", important: false },
  { text: "", important: false },
  { text: "They alone held the power to", important: false },
  { text: "restore what was broken.", important: false },
  { text: "", important: false },
  { text: "You are the last of them.", important: true },
  { text: "", important: false },
  { text: "You are... a ZETATRAVELER.", important: true },
];

export function Intro({ onComplete }: IntroProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [canAdvance, setCanAdvance] = useState(true);

  const currentStoryLine = storyLines[currentLine];
  const isImportant = currentStoryLine.important;

  const advanceText = useCallback(() => {
    if (!canAdvance) return;
    
    if (isTyping && !isImportant) {
      setDisplayedText(currentStoryLine.text);
      setIsTyping(false);
    } else if (!isTyping) {
      if (currentLine < storyLines.length - 1) {
        setCurrentLine(currentLine + 1);
        setDisplayedText("");
        setIsTyping(true);
        setCanAdvance(true);
      } else {
        onComplete();
      }
    }
  }, [currentLine, isTyping, onComplete, canAdvance, isImportant, currentStoryLine.text]);

  useEffect(() => {
    if (!isTyping) return;

    const line = currentStoryLine.text;
    const typeSpeed = isImportant ? 120 : 50;
    
    if (displayedText.length < line.length) {
      if (isImportant) {
        setCanAdvance(false);
      }
      const timer = setTimeout(() => {
        setDisplayedText(line.slice(0, displayedText.length + 1));
      }, typeSpeed);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      if (isImportant) {
        const unlockTimer = setTimeout(() => {
          setCanAdvance(true);
        }, 1000);
        return () => clearTimeout(unlockTimer);
      }
    }
  }, [displayedText, currentLine, isTyping, isImportant, currentStoryLine.text]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "z" || e.key === "Z" || e.key === "Enter" || e.key === " ") {
        advanceText();
      }
      if ((e.key === "x" || e.key === "X" || e.key === "Shift") && !isImportant) {
        onComplete();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [advanceText, onComplete, isImportant]);

  const handleClick = () => {
    if (!isImportant || !isTyping) {
      advanceText();
    }
  };

  return (
    <div 
      className="w-full h-full bg-black flex flex-col items-center justify-center cursor-pointer select-none"
      onClick={handleClick}
    >
      <div 
        className="max-w-2xl text-center px-8"
        style={{ minHeight: "80px" }}
      >
        <p
          className="text-2xl text-white leading-relaxed"
          style={{ 
            fontFamily: "'Courier New', monospace",
            textShadow: currentStoryLine.text.includes("TRAVELER") || currentStoryLine.text.includes("last of them")
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
          {isImportant && isTyping 
            ? "..." 
            : isImportant && !canAdvance
            ? "..."
            : "Press Z or click to continue... Press X to skip"
          }
        </p>
      </div>
    </div>
  );
}
