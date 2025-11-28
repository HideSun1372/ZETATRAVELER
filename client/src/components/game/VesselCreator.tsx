import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";

interface VesselCreatorProps {
  onComplete: (name: string) => void;
}

type Step = 
  | { type: "dialogue"; text: string } 
  | { type: "choice"; text: string; options: string[] } 
  | { type: "input"; text: string } 
  | { type: "summary" }
  | { type: "twist"; text: string }
  | { type: "final"; text: string };

const bodyOptions = ["ROUND", "TALL", "SMALL", "WIDE"];
const headOptions = ["GENTLE", "SHARP", "HOLLOW", "BRIGHT"];
const foodOptions = ["SWEET", "SOUR", "BITTER", "SAVORY"];
const bloodOptions = ["A", "B", "AB", "O"];
const colorOptions = ["RED", "BLUE", "GREEN", "YELLOW"];
const giftOptions = ["FLOWER", "COIN", "FEATHER", "STONE"];
const feelingOptions = ["PROUD", "UNSURE", "AFRAID", "HOPEFUL"];
const honestOptions = ["YES", "NO"];

export function VesselCreator({ onComplete }: VesselCreatorProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [canProceed, setCanProceed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showBackground, setShowBackground] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(0);
  const [whiteOverlay, setWhiteOverlay] = useState(0);
  const [twistTriggered, setTwistTriggered] = useState(false);
  const [pauseBeforeTyping, setPauseBeforeTyping] = useState(false);
  const [droneStarted, setDroneStarted] = useState(false);
  const musicRef = useRef<Howl | null>(null);
  const droneRef = useRef<Howl | null>(null);
  
  const [body, setBody] = useState("");
  const [head, setHead] = useState("");
  const [name, setName] = useState("");
  const [food, setFood] = useState("");
  const [blood, setBlood] = useState("");
  const [color, setColor] = useState("");
  const [gift, setGift] = useState("");
  const [feeling, setFeeling] = useState("");

  const steps: Step[] = [
    { type: "dialogue", text: "HELLO?" },
    { type: "dialogue", text: "CAN YOU HEAR ME?" },
    { type: "dialogue", text: "GOOD. LET US PROCEED." },
    { type: "dialogue", text: "A TRAVELER REQUIRES A FORM." },
    { type: "choice", text: "CHOOSE A BODY.", options: bodyOptions },
    { type: "choice", text: "CHOOSE A SPIRIT.", options: headOptions },
    { type: "input", text: "WHAT SHALL IT BE CALLED?" },
    { type: "dialogue", text: "THIS SHALL CARRY YOU ACROSS THE STARS." },
    { type: "summary" },
    { type: "dialogue", text: "FASCINATING." },
    { type: "dialogue", text: "TRULY REMARKABLE CHOICES." },
    { type: "choice", text: "WHAT TASTE DOES IT PREFER?", options: foodOptions },
    { type: "choice", text: "WHICH HUE CALLS TO IT?", options: colorOptions },
    { type: "choice", text: "GRANT IT A TOKEN.", options: giftOptions },
    { type: "choice", text: "WHAT DO YOU THINK OF YOUR WORK? IT CANNOT HEAR YOU.", options: feelingOptions },
    { type: "choice", text: "WERE ALL YOUR ANSWERS TRUE?", options: honestOptions },
    { type: "dialogue", text: "YOU ACCEPT WHATEVER MAY COME." },
    { type: "dialogue", text: "HOW PECULIAR." },
    { type: "dialogue", text: "EVERYTHING YOU HAVE MADE," },
    { type: "dialogue", text: "EVERY CAREFUL DECISION," },
    { type: "twist", text: "Means nothing." },
    { type: "twist", text: "You cannot design your own soul." },
    { type: "final", text: "Your name is" },
  ];

  const currentStep = steps[stepIndex];
  const currentText = currentStep.type === "summary" 
    ? `BODY: ${body}\nSPIRIT: ${head}\nNAME: ${name}\n\nIS THIS CORRECT?`
    : currentStep.text;

  useEffect(() => {
    setWhiteOverlay(0);
    setBgOpacity(0);
  }, []);

  useEffect(() => {
    if (stepIndex === 0 && !droneStarted) {
      setDroneStarted(true);
      droneRef.current = new Howl({
        src: ["/sounds/drone.mp3"],
        loop: true,
        volume: 0,
      });
      droneRef.current.play();
      droneRef.current.fade(0, 0.5, 1500);
    }
  }, [stepIndex, droneStarted]);

  useEffect(() => {
    setDisplayedText("");
    setCanProceed(false);
    setSelectedIndex(0);
    
    if (stepIndex === 21) {
      setPauseBeforeTyping(true);
      setIsTyping(false);
      setTimeout(() => {
        setPauseBeforeTyping(false);
        setIsTyping(true);
      }, 2500);
    } else {
      setIsTyping(true);
    }
  }, [stepIndex]);

  useEffect(() => {
    if (stepIndex === 3 && !showBackground) {
      setShowBackground(true);
      
      if (droneRef.current) {
        droneRef.current.fade(droneRef.current.volume(), 0, 2000);
        setTimeout(() => {
          droneRef.current?.stop();
        }, 2000);
      }
      
      if (!musicRef.current) {
        musicRef.current = new Howl({
          src: ["/sounds/vessel_music.mp3"],
          loop: true,
          volume: 0,
        });
      }
      
      musicRef.current.play();
      musicRef.current.fade(0, 0.6, 3000);
      
      let opacity = 0;
      const fadeInterval = setInterval(() => {
        opacity += 0.02;
        if (opacity >= 0.4) {
          opacity = 0.4;
          clearInterval(fadeInterval);
        }
        setBgOpacity(opacity);
      }, 50);
    }
  }, [stepIndex, showBackground]);

  useEffect(() => {
    if (currentStep.type === "twist" && !twistTriggered) {
      setTwistTriggered(true);
      
      if (musicRef.current) {
        musicRef.current.stop();
      }
      
      setBgOpacity(0);
    }
  }, [currentStep.type, twistTriggered]);

  useEffect(() => {
    if (currentStep.type === "final") {
      setTimeout(() => {
        let white = 0;
        const fadeInterval = setInterval(() => {
          white += 0.025;
          if (white >= 1) {
            white = 1;
            clearInterval(fadeInterval);
            setTimeout(() => {
              onComplete(name);
            }, 500);
          }
          setWhiteOverlay(white);
        }, 40);
      }, 1200);
    }
  }, [currentStep.type, name, onComplete]);

  useEffect(() => {
    return () => {
      if (musicRef.current) {
        musicRef.current.stop();
        musicRef.current.unload();
      }
      if (droneRef.current) {
        droneRef.current.stop();
        droneRef.current.unload();
      }
    };
  }, []);

  useEffect(() => {
    if (!isTyping) return;

    if (displayedText.length < currentText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(currentText.slice(0, displayedText.length + 1));
      }, 120);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      setTimeout(() => setCanProceed(true), 500);
    }
  }, [displayedText, currentText, isTyping]);

  const handleProceed = () => {
    if (!canProceed) return;
    if (currentStep.type === "final") return;

    if (currentStep.type === "dialogue" || currentStep.type === "twist") {
      setStepIndex(stepIndex + 1);
    } else if (currentStep.type === "choice") {
      const options = currentStep.options;
      const selected = options[selectedIndex];
      
      if (currentStep.text.includes("BODY")) {
        setBody(selected);
      } else if (currentStep.text.includes("SPIRIT")) {
        setHead(selected);
      } else if (currentStep.text.includes("TASTE")) {
        setFood(selected);
      } else if (currentStep.text.includes("VEINS")) {
        setBlood(selected);
      } else if (currentStep.text.includes("HUE")) {
        setColor(selected);
      } else if (currentStep.text.includes("TOKEN")) {
        setGift(selected);
      } else if (currentStep.text.includes("THINK")) {
        setFeeling(selected);
      } else if (currentStep.text.includes("TRUE")) {
        if (selected === "NO") {
          setStepIndex(4);
          setBody("");
          setHead("");
          setName("");
          return;
        }
      }
      setStepIndex(stepIndex + 1);
    } else if (currentStep.type === "input") {
      if (name.trim().length > 0) {
        setStepIndex(stepIndex + 1);
      }
    } else if (currentStep.type === "summary") {
      if (selectedIndex === 0) {
        setStepIndex(stepIndex + 1);
      } else {
        setStepIndex(4);
        setBody("");
        setHead("");
        setName("");
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentStep.type === "input" && canProceed) {
        if (e.key === "Backspace") {
          setName((prev) => prev.slice(0, -1));
        } else if (e.key === "Enter" && name.trim().length > 0) {
          handleProceed();
        } else if (e.key.length === 1 && name.length < 12) {
          if (/^[a-zA-Z0-9 ]$/.test(e.key)) {
            setName((prev) => prev + e.key.toUpperCase());
          }
        }
        return;
      }

      if (currentStep.type === "choice" || currentStep.type === "summary") {
        const options = currentStep.type === "choice" ? currentStep.options : ["YES", "NO"];
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          setSelectedIndex((prev) => (prev - 1 + options.length) % options.length);
        } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          setSelectedIndex((prev) => (prev + 1) % options.length);
        }
      }

      if (e.key === "Enter" || e.key === "z" || e.key === "Z") {
        handleProceed();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, canProceed, name, selectedIndex, stepIndex]);

  const getOptions = () => {
    if (currentStep.type === "choice") return currentStep.options;
    if (currentStep.type === "summary") return ["YES", "NO"];
    return [];
  };

  const isTwistOrFinal = currentStep.type === "twist" || currentStep.type === "final";
  const fontFamily = isTwistOrFinal ? "'Open Sans', sans-serif" : "'Courier New', monospace";

  return (
    <div className="w-full h-full bg-black select-none relative overflow-hidden">
      <img
        src="/textures/vessel_bg.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: bgOpacity,
          transition: "opacity 0.5s ease-out",
        }}
      />
      <div 
        className="absolute left-1/2 text-center max-w-xl px-4 z-10"
        style={{ top: "35%", transform: "translateX(-50%)" }}
      >
        <div style={{ minHeight: "80px" }}>
          {currentStep.type === "summary" ? (
            <div
              className="text-xl text-white whitespace-pre-line leading-relaxed"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {displayedText}
            </div>
          ) : (
            <p
              className={`leading-relaxed ${isTwistOrFinal ? "text-xl text-white/90" : "text-2xl text-white"}`}
              style={{ fontFamily }}
            >
              {displayedText}
              {isTyping && <span className="opacity-50">|</span>}
            </p>
          )}
        </div>

        {canProceed && currentStep.type === "input" && (
          <div className="mt-8 mb-4">
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
              [Type a name, then press Enter]
            </p>
          </div>
        )}

        {canProceed && (currentStep.type === "choice" || currentStep.type === "summary") && (
          <div className="mt-8 space-y-2">
            {getOptions().map((option, index) => (
              <div
                key={option}
                onClick={() => {
                  setSelectedIndex(index);
                }}
                onDoubleClick={handleProceed}
                className={`cursor-pointer py-2 text-xl transition-colors ${
                  index === selectedIndex
                    ? "text-yellow-400"
                    : "text-gray-500 hover:text-gray-300"
                }`}
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                {index === selectedIndex ? "▶ " : "  "}
                {option}
              </div>
            ))}
            <p
              className="text-gray-500 text-sm mt-4"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              [W/S or Arrows to select, Z/Enter to confirm]
            </p>
          </div>
        )}

        {canProceed && (currentStep.type === "dialogue" || currentStep.type === "twist") && (
          <p
            className="text-gray-400 text-sm mt-12 animate-pulse"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            [Press Z or Enter to continue]
          </p>
        )}
      </div>
      
      {whiteOverlay > 0 && (
        <div 
          className="absolute inset-0 bg-white z-50 pointer-events-none"
          style={{ opacity: whiteOverlay }}
        />
      )}
    </div>
  );
}
