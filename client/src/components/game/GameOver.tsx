import { useState, useEffect } from "react";
import { useRPG } from "../../lib/stores/useRPG";

export function GameOver() {
  const { 
    setGamePhase, 
    lastBattlePlanetId,
    maxHp,
  } = useRPG();
  
  const [selectedOption, setSelectedOption] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  
  const message = "YOU CANNOT GIVE UP JUST YET...";
  const options = ["RETRY", "RETURN TO HUB"];

  useEffect(() => {
    if (displayedText.length < message.length) {
      const timer = setTimeout(() => {
        setDisplayedText(message.slice(0, displayedText.length + 1));
      }, 80);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setShowOptions(true), 500);
    }
  }, [displayedText]);

  const handleSelect = () => {
    const healPlayer = useRPG.getState().heal;
    
    if (selectedOption === 0) {
      healPlayer(maxHp);
      setGamePhase(lastBattlePlanetId === 0 ? "hub" : "planet");
    } else {
      healPlayer(maxHp);
      useRPG.getState().returnToHub();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showOptions) return;
      
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        setSelectedOption((prev) => (prev - 1 + options.length) % options.length);
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        setSelectedOption((prev) => (prev + 1) % options.length);
      } else if (e.key === "z" || e.key === "Z" || e.key === "Enter") {
        handleSelect();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showOptions, selectedOption]);

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center select-none">
      <div className="text-center">
        <p
          className="text-red-600 text-4xl mb-8"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          {displayedText}
        </p>
        
        {showOptions && (
          <div className="space-y-4">
            {options.map((option, index) => (
              <div
                key={option}
                className={`text-2xl cursor-pointer transition-colors ${
                  index === selectedOption
                    ? "text-yellow-400"
                    : "text-gray-600 hover:text-gray-400"
                }`}
                style={{ fontFamily: "'Courier New', monospace" }}
                onClick={() => {
                  setSelectedOption(index);
                  handleSelect();
                }}
              >
                {index === selectedOption ? "▶ " : "  "}
                {option}
              </div>
            ))}
            
            <p
              className="text-gray-500 text-sm mt-8"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              [W/S or Arrows to select, Z/Enter to confirm]
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
