import { useState, useEffect, useRef, useMemo } from "react";
import { Howl } from "howler";

interface IntroCutsceneProps {
  playerName: string;
  onComplete: () => void;
}

type CutsceneStep = 
  | { type: "fade_from_white" }
  | { type: "dialogue"; text: string; speaker?: string }
  | { type: "narration"; text: string }
  | { type: "pause"; duration: number }
  | { type: "fade_to_black" };

export function IntroCutscene({ playerName, onComplete }: IntroCutsceneProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [whiteOverlay, setWhiteOverlay] = useState(1);
  const [blackOverlay, setBlackOverlay] = useState(0);
  const [showScene, setShowScene] = useState(false);
  const musicRef = useRef<Howl | null>(null);
  const cHeldRef = useRef(false);
  const cIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const steps: CutsceneStep[] = useMemo(() => [
    { type: "fade_from_white" },
    { type: "dialogue", text: "Aiden!", speaker: "???" },
    { type: "pause", duration: 500 },
    { type: "dialogue", text: "Aiden, wake up!", speaker: "???" },
    { type: "dialogue", text: "Finally. I thought you'd sleep through the whole briefing.", speaker: "COMMANDER" },
    { type: "dialogue", text: "Listen closely. The galaxy is fracturing.", speaker: "COMMANDER" },
    { type: "dialogue", text: "50 planets. 75 Nebuli shards. You're our last hope.", speaker: "COMMANDER" },
    { type: "dialogue", text: "Find the shards. Seal the cores. Save what's left.", speaker: "COMMANDER" },
    { type: "pause", duration: 800 },
    { type: "dialogue", text: "The ship is ready. Your journey begins now, Zetatraveler.", speaker: "COMMANDER" },
    { type: "fade_to_black" },
  ], []);

  const currentStep = steps[stepIndex];

  useEffect(() => {
    if (!musicRef.current) {
      musicRef.current = new Howl({
        src: ["/sounds/background.mp3"],
        loop: true,
        volume: 0,
      });
      musicRef.current.play();
      musicRef.current.fade(0, 0.3, 2000);
    }

    return () => {
      if (musicRef.current) {
        musicRef.current.fade(musicRef.current.volume(), 0, 1000);
        setTimeout(() => {
          musicRef.current?.stop();
          musicRef.current?.unload();
        }, 1000);
      }
    };
  }, []);

  useEffect(() => {
    if (!currentStep) return;

    if (currentStep.type === "fade_from_white") {
      setShowScene(true);
      let white = 1;
      const fadeInterval = setInterval(() => {
        white -= 0.02;
        if (white <= 0) {
          white = 0;
          clearInterval(fadeInterval);
          setTimeout(() => setStepIndex(stepIndex + 1), 500);
        }
        setWhiteOverlay(white);
      }, 30);
    } else if (currentStep.type === "dialogue" || currentStep.type === "narration") {
      setDisplayedText("");
      setIsTyping(true);
      setCanProceed(false);
    } else if (currentStep.type === "pause") {
      setCanProceed(false);
      setTimeout(() => {
        setStepIndex(stepIndex + 1);
      }, currentStep.duration);
    } else if (currentStep.type === "fade_to_black") {
      let black = 0;
      const fadeInterval = setInterval(() => {
        black += 0.02;
        if (black >= 1) {
          black = 1;
          clearInterval(fadeInterval);
          setTimeout(() => onComplete(), 800);
        }
        setBlackOverlay(black);
      }, 30);
    }
  }, [stepIndex, currentStep, onComplete]);

  useEffect(() => {
    if (!currentStep) return;
    if (currentStep.type !== "dialogue" && currentStep.type !== "narration") return;
    if (!isTyping) return;

    const text = currentStep.text;
    if (displayedText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, 40);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      setTimeout(() => setCanProceed(true), 300);
    }
  }, [displayedText, currentStep, isTyping]);

  const skipTyping = () => {
    if (!currentStep) return;
    if (currentStep.type !== "dialogue" && currentStep.type !== "narration") return;
    if (isTyping) {
      setDisplayedText(currentStep.text);
      setIsTyping(false);
      setTimeout(() => setCanProceed(true), 50);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // X key: Skip typing animation and show full text
      if (e.key === "x" || e.key === "X") {
        skipTyping();
        return;
      }

      // C key: Instantly show dialogue and skip to next
      if ((e.key === "c" || e.key === "C") && !cHeldRef.current) {
        cHeldRef.current = true;
        
        // Instantly advance to next step
        if (stepIndex < steps.length - 1) {
          setStepIndex(stepIndex + 1);
        }
        
        // Set up interval for continuous skipping while held
        cIntervalRef.current = setInterval(() => {
          setStepIndex(prev => {
            if (prev < steps.length - 1) {
              return prev + 1;
            }
            return prev;
          });
        }, 120);
        return;
      }

      if (!canProceed) return;
      if (e.key === "Enter" || e.key === "z" || e.key === "Z" || e.key === " ") {
        if (stepIndex < steps.length - 1) {
          setStepIndex(stepIndex + 1);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "c" || e.key === "C") {
        cHeldRef.current = false;
        if (cIntervalRef.current) {
          clearInterval(cIntervalRef.current);
          cIntervalRef.current = null;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (cIntervalRef.current) {
        clearInterval(cIntervalRef.current);
      }
    };
  }, [canProceed, stepIndex, steps.length, isTyping, currentStep]);

  const renderDialogue = () => {
    if (!currentStep) return null;
    if (currentStep.type !== "dialogue" && currentStep.type !== "narration") return null;

    const isNarration = currentStep.type === "narration";
    const speaker = currentStep.type === "dialogue" ? currentStep.speaker : null;

    return (
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div 
          className="max-w-4xl mx-auto bg-black/90 border-2 border-white/30 p-6 rounded"
          style={{ minHeight: "120px" }}
        >
          {speaker && (
            <div 
              className="text-yellow-400 text-lg mb-2 font-bold"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {speaker}
            </div>
          )}
          <p
            className={`text-xl leading-relaxed ${isNarration ? "text-gray-300 italic" : "text-white"}`}
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            {displayedText}
            {isTyping && <span className="opacity-50">|</span>}
          </p>
          {canProceed && (
            <p className="text-gray-500 text-sm mt-4 animate-pulse">
              [Press Z or Enter to continue]
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-black select-none relative overflow-hidden">
      {showScene && (
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-64 h-64 mx-auto mb-8 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-900 to-purple-900 opacity-30" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-blue-500/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse" />
                </div>
                <div className="absolute top-1/2 left-0 w-full h-px bg-blue-500/20" />
                <div className="absolute top-0 left-1/2 w-px h-full bg-blue-500/20" />
              </div>
              <div 
                className="text-blue-400/60 text-sm tracking-widest"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                ZETA STATION - EARTH ORBIT
              </div>
            </div>
          </div>
          
          <div className="absolute top-4 left-4 flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
          
          <div className="absolute top-4 right-4 text-green-500/60 text-xs" style={{ fontFamily: "'Courier New', monospace" }}>
            SYSTEM ONLINE
          </div>
        </div>
      )}

      {renderDialogue()}

      {whiteOverlay > 0 && (
        <div 
          className="absolute inset-0 bg-white z-50 pointer-events-none"
          style={{ opacity: whiteOverlay }}
        />
      )}

      {blackOverlay > 0 && (
        <div 
          className="absolute inset-0 bg-black z-50 pointer-events-none"
          style={{ opacity: blackOverlay }}
        />
      )}
    </div>
  );
}
