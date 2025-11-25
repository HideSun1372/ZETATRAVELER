import { useState, useEffect, useCallback } from "react";

interface VesselCreatorProps {
  onComplete: (name: string) => void;
}

type CreationStep = 
  | "welcome"
  | "body"
  | "head"
  | "favorite"
  | "name"
  | "confirm"
  | "discard";

const bodyOptions = ["ROUND", "TALL", "SMALL", "WIDE"];
const headOptions = ["GENTLE", "SHARP", "HOLLOW", "BRIGHT"];
const favoriteOptions = ["KINDNESS", "AMBITION", "PATIENCE", "COURAGE"];

export function VesselCreator({ onComplete }: VesselCreatorProps) {
  const [step, setStep] = useState<CreationStep>("welcome");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [body, setBody] = useState("");
  const [head, setHead] = useState("");
  const [favorite, setFavorite] = useState("");
  const [name, setName] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [canProceed, setCanProceed] = useState(false);

  const messages: Record<CreationStep, string> = {
    welcome: "WELCOME, TRAVELER.",
    body: "FIRST, CHOOSE A FORM FOR YOUR VESSEL.",
    head: "NOW, CHOOSE ITS NATURE.",
    favorite: "WHAT QUALITY DO YOU VALUE MOST?",
    name: "FINALLY... GIVE YOUR VESSEL A NAME.",
    confirm: `YOUR VESSEL... "${name}"... IS THIS CORRECT?`,
    discard: "INTERESTING. BUT IT MATTERS NOT.",
  };

  const currentMessage = messages[step];

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    setCanProceed(false);
    setSelectedIndex(0);
  }, [step]);

  useEffect(() => {
    if (!isTyping) return;

    if (displayedText.length < currentMessage.length) {
      const timer = setTimeout(() => {
        setDisplayedText(currentMessage.slice(0, displayedText.length + 1));
      }, 40);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      setTimeout(() => setCanProceed(true), 300);
    }
  }, [displayedText, currentMessage, isTyping]);

  const getCurrentOptions = () => {
    switch (step) {
      case "body": return bodyOptions;
      case "head": return headOptions;
      case "favorite": return favoriteOptions;
      case "confirm": return ["YES", "NO"];
      default: return [];
    }
  };

  const handleSelect = useCallback(() => {
    if (!canProceed) return;

    switch (step) {
      case "welcome":
        setStep("body");
        break;
      case "body":
        setBody(bodyOptions[selectedIndex]);
        setStep("head");
        break;
      case "head":
        setHead(headOptions[selectedIndex]);
        setStep("favorite");
        break;
      case "favorite":
        setFavorite(favoriteOptions[selectedIndex]);
        setStep("name");
        break;
      case "name":
        if (name.trim().length > 0) {
          setStep("confirm");
        }
        break;
      case "confirm":
        if (selectedIndex === 0) {
          setStep("discard");
        } else {
          setStep("name");
        }
        break;
      case "discard":
        onComplete(name);
        break;
    }
  }, [step, selectedIndex, name, canProceed, onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const options = getCurrentOptions();

      if (step === "name" && !isTyping) {
        if (e.key === "Backspace") {
          setName((prev) => prev.slice(0, -1));
        } else if (e.key === "Enter" && name.trim().length > 0) {
          handleSelect();
        } else if (e.key.length === 1 && name.length < 12) {
          if (/^[a-zA-Z0-9 ]$/.test(e.key)) {
            setName((prev) => prev + e.key.toUpperCase());
          }
        }
        return;
      }

      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        if (options.length > 0) {
          setSelectedIndex((prev) => (prev - 1 + options.length) % options.length);
        }
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        if (options.length > 0) {
          setSelectedIndex((prev) => (prev + 1) % options.length);
        }
      } else if (e.key === "Enter" || e.key === "z" || e.key === "Z") {
        handleSelect();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, selectedIndex, name, isTyping, handleSelect]);

  const options = getCurrentOptions();

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center select-none">
      <div className="text-center max-w-xl">
        <p
          className="text-2xl text-white mb-12"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          {displayedText}
          {isTyping && <span className="animate-pulse">|</span>}
        </p>

        {canProceed && step === "name" && (
          <div className="mb-8">
            <div 
              className="w-64 mx-auto border-4 border-white p-4"
              style={{ minHeight: "50px" }}
            >
              <p
                className="text-2xl text-white text-center"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                {name}
                <span className="animate-pulse">_</span>
              </p>
            </div>
            <p
              className="text-gray-500 text-sm mt-4"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              Type to enter, Enter to confirm
            </p>
          </div>
        )}

        {canProceed && options.length > 0 && step !== "name" && (
          <div className="space-y-3">
            {options.map((option, index) => (
              <div
                key={option}
                onClick={() => {
                  setSelectedIndex(index);
                  handleSelect();
                }}
                className={`cursor-pointer py-2 px-6 text-xl transition-colors ${
                  index === selectedIndex
                    ? "text-yellow-400"
                    : "text-gray-400 hover:text-white"
                }`}
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                {index === selectedIndex && "▶ "}
                {option}
              </div>
            ))}
          </div>
        )}

        {canProceed && step === "welcome" && (
          <p
            className="text-gray-500 text-sm animate-pulse"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            Press Z or Enter to continue
          </p>
        )}

        {canProceed && step === "discard" && (
          <div className="mt-8">
            <p
              className="text-gray-400 text-lg mb-4"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              YOUR CHOICES DO NOT MATTER.
            </p>
            <p
              className="text-gray-400 text-lg mb-4"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              YOUR VESSEL WILL BE DISCARDED.
            </p>
            <p
              className="text-white text-xl mt-8"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              YOU ARE... A ZETATRAVELER.
            </p>
            <p
              className="text-gray-500 text-sm mt-8 animate-pulse"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              Press Z or Enter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
